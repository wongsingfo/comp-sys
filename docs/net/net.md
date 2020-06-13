---
layout: default
title: Network Stack
nav_order: 21
permalink: docs/net
has_children: true
graphviz: true
---

# Linux Network Stack
{: .no_toc }

Tools:

- `telnet`
- `nc`

References:
{:toc}

This page is based on the Linux Kernel [4.19.101](https://elixir.bootlin.com/linux/v4.19.101/source).

- Linux Kernel Networking Implementation and Theory
- Understanding Linux Network Internals
- [Netfilter](http://www.netfilter.org/)
- [ip-xfrm(8)](http://man7.org/linux/man-pages/man8/ip-xfrm.8.html)
- Glenn Herrin. Linux IP Networking, A Guide to the Implementation and Modification of the Linux Protocol Stack. 2000

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

The structure:

- BSD sockets ([sys_socketcall](`http://man7.org/linux/man-pages/man2/socketcall.2.html))
- Netfilter / Nftables
- Network Protocol
    - TCP / UDP
    - IP
- Packet Scheduler
- Device Drivers

{% include img.html filename="Screen Shot 2020-05-23 at 10.53.26 AM.png" width=550 %}

The `init` program runs the script `/etc/init.d/networking` which enables the networking.

## Data Structures

struct proto_ops
{{ site.struct_style }}

for virtual dispatching

- `int family`
- `int (*bind) (struct socket *sock, ...)` and others

struct socket
{{ site.struct_style }}

an abstraction very close to user space, ie BSD sockets used to program network applications. Defined at `/include/linux/net.h:110`

- `struct file *file`: File back pointer for gc
- `socket_state state`: socket state (`%SS_CONNECTED`, etc)
- `short type`: socket type (`%SOCK_STREAM`, etc)
- `const struct proto_ops *ops`:
- `struct socket_wq *wq;`: wait queue for several uses
- `struct sock *sk;`: internal networking protocol agnostic socket representation

struct sock
{{ site.struct_style }}

the network representation of a socket (also known as _INET socket_) Defined at `/include/linux/sock.h:327`

- `struct socket_wq __rcu *sk_wq`: sock wait queue and async head
- `u8 sk_shutdown`: mask of `SEND_SHUTDOWN` and/or `RCV_SHUTDOWN`
- `atomic_t sk_drops`: raw/udp drops counter
- `struct sk_buff_head sk_write_queue`
- `u32 sk_pacing_rate`
- `struct sk_buff_head sk_receive_queue`
- `struct sk_backlog {struct sk_buff *head, *tail; ...}`
- `u8 sk_protocol`: which protocol this socket belongs in this network family
- `void (*sk_data_ready)(struct sock *sk)` and others: callback
- `int sk_rcvbuf`: size of receive buffer in bytes
- `int sk_forward_alloc`: space allocated forward
- `atomic_t sk_backlog.rmem_alloc`
    - UDP: size of the space used for buffer recevied packets
- `atomic_t sk_drops`: raw/udp drops counter
- `__s32 sk_peek_off`: current peek_offset value
- `long sk_rcvtimeo`: SO_RCVTIMEO

superclass: `struct sock_common __sk_common` (inet_timewait_sock)

subclass:

- `struct inet_sock` defined at `/include/net/inet_sock.h:177`
- `struct udp_sock`
  - `struct sk_buff_head reader_queue ____cacheline_aligned_in_smp`: udp_recvmsg try to use this before splicing sk_receive_queue


struct sk_buff
{{ site.struct_style }}

the representation of a network packet and its status. Defined in `/include/linux/skbuff.h:665`

- `struct list_head list`
- `struct sock *sk;`: Socket we are owned by
- `struct net_device *dev;`: Device we arrived on/are leaving by
- `unsigned char *head, *data`: Head of buffer; Data head pointer
- `sk_buff_data_t tail, end`: see `alloc_skb()` for details.
- `unsigned int truesize`: buffer size
- `char cb[48] __aligned(8)`: control buffer, that is free to use for every layer
  - UDP: `struct sock_skb_cb { u32 dropcount; }`
- `unsigned int truesize`: the length of the variable size data component(s) plus the size of the `sk_buff` header. **This is the amount that is charged against the sock's send or receive quota.**
- `unsigned int len`: the size of a complete input packet, includeing data in the kmalloc'd part, fragment chain and/or unmapped page buffers.
- `unsigned int data_len`: the number of bytes in the fragment chain and in unmapped page buffers and is normally 0.

{% include img.html filename="skb_layout.png" width=550 %}

A buffer is _linear_ if and only if all the data is contained in the kmalloc'd header. Here are some cases where the buffer is not linear (Probably 1/2 of the network code in the kernel is dedicated to dealing with the rarely used abomination):

- data is stored in different locations of physical pages (common in NIC driver model) (_unmapped page buffers_)
- IP packet fragmentation (_fragment chain_)
- large TCP data packets are cut into several MTU size

struct dst_entry
{{ site.struct_style }}

Defined in `/include/net/dst.h`. It denotes the route for this `sk_buff`; the route is determined by the routing subsystem.

- `int (*input)(struct sk_buff *)`:  `ip_local_deliver`,  `ip_forward`,  `ip_mr_input`,  `ip_error`,  `dst_discard_in`
- `int (*output)(struct net *net, struct sock *sk, struct sk_buff *skb);`:  `ip_output`,  `ip_mc_output`, `ip_rt_bug`, `dst_discard_out`

struct net_device
{{ site.struct_style }}

Defined at `/include/linux/netdevice.h:1747`. It represents physical or virtual device (Every interface except aliasing interface is assigned a `net_device`). Actually, this whole structure is a big mistake.  It mixes I/O data with strictly "high-level" data, and it has to know about almost every data structure used in the INET module. It is initialized by the device driver and the core kernel routines. 

When the relationship of vitural device to real device is not one-to-one, the `dev_queue_xmit` may need to select the real device to use. Becasue QoS is enforced on a per-device basis.

Memory-mapped IO (MMIO): `request_region`, `release_region`

- Each network device is assigned a queuing discipline.
  - bitmap `state`:  used by Traffic Control 
- `unsigned int mtu`
- `struct netdev_rx_queue *_rx`
- `possible_net_t nd_net;`

struct net
{{ site.struct_style }}

network namspace. Defined at `/include/net/net_namespace.h:51`

struct net_protocol
{{ site.struct_style }}

Defined in `/include/net/protocol.h:41`. This is used to register protocols. `extern struct net_protocol __rcu *inet_protos[MAX_INET_PROTOS]`

- `int (*handler)(struct sk_buff *skb)`

example `/net/ipv4/af_inet.c:1694`:

```c
static struct net_protocol udp_protocol = {
    .early_demux =  udp_v4_early_demux,
    .early_demux_handler =  udp_v4_early_demux,
    .handler =  udp_rcv,
    .err_handler =  udp_err,
    .no_policy =    1,
    .netns_ok = 1,
};
```

## Packet Tour

{% include img.html filename="Network_data_flow_through_kernel.png" %}

Receiving Packets:

1. Driver: `core/dev.c:netif_rx`
   1. puts skb into CPU queue
   2. issues a soft interrupt
2. CPU: `corz/dev.c:net_rx_action`
   1. Remove skb from CPU queue
   2. passes to network layer (e.g. `ipv4/ip_input.c:ip_rcv`)
3. Forwarding
   1. `/proc/sys/net/ipv4/conf/<device>/forwarding` 
   2. `/proc/sys/net/ipv4/conf/default/forwarding`
   3. `/proc/sys/net/ipv4/ip_forwarding`

Sending Packets:

1. `core/dev.c:dev_queue_xmit`
2. `sched/sch_generic.c:pfifo_fast_enqueue`
   3. Default queue: priority FIFO
   2. Disc `pkt_sched.c`
   3. IP Tos: PPPDTRCX
      1. PPP: precedence (ignored by Linux)
      2. D: minimize delay
      3. T: maximize throughput
      4. R: maximize reliability
      5. C: minimize cost
      6. X: reserved
3. `pfifo_fast_dequeue`: pass a packet to the device driver

## Routing

The routing table (also called FIB) and the routing cache enable us to find the net device and the address of the host to which a packet will be sent. Reading entries in the routing table is done by calling`fib_lookup(const struct flowi *flp, struct fib_result *res`. (FIB: Forwarding Information Base)

There are two routing tables by default (`include/net/ip_fib.h`)

- `ip_fib_local_talbe`, ID 255. A successful lookup means that the packet is to be delivered on the host itself.
- `ip_fib_main_talbe`, ID 25. A table for all other routes, manually configured by the user or routing protocols.

Both routes and IP addresses are assigned scopes. 

- Host: loopback
- Link: a LAN
- Universe

Primary and Secondary address: An address is considered secondary if it falls within the subnet of another already configured address on the same NIC. Thus, the order in which addresses are configured is important.

Route actions:

- Black hole
- Unreachable: generate ICMP message
- Prohibit: generate ICMP message
- Throw: continue with the matching (used with policy routing)

## Multicast Routing (IPMR)

## Software Forwarding

Interface between control and forwarding planes:

- Linux: 
  - old: /proc, sysctl, ioctl
  - new: netlink
- BSD:
  - routing socket
- OpenFlow: SDN for L2

## XFRM

xfrm is an IP framework for transforming packets (such as encrypting their payloads). This framework is used to implement the IPsec protocol suite. It is also used for the IP Payload Compression Protocol and features of Mobile IPv6.

IPsec is a useful feature for securing network traffic, but the computational cost is high: a 10Gbps link can easily be brought down to under 1Gbps, depending on the traffic and link configuration. Luckily, there are NICs that offer a hardware based IPsec offload which can radically increase throughput and decrease CPU utilization. The XFRM Device interface allows NIC drivers to offer to the stack access to the hardware offload.

Userland access to the offload is typically through a system such as libreswan or KAME/raccoon, but the iproute2 `ip xfrm` command set can be handy when experimenting.



