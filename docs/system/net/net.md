---
layout: default
title: Network Stack
parent: Computer System
nav_order: 20
permalink: docs/system/net
has_children: true
graphviz: true
---

# Linux Network Stack
{: .no_toc }

References:
{:toc}

This page is based on the Linux Kernel [4.19.101](https://elixir.bootlin.com/linux/v4.19.101/source).

- [Netfilter](http://www.netfilter.org/)
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

The `init` program runs the script `/etc/init.d/networking` which enables the networking.

## Core Data Structures

struct proto_ops
{{ site.struct_style }}

- `int family`
- `int (*bind) (struct socket *sock, ...)` and others

struct socket
{{ site.struct_style }}

an abstraction very close to user space, ie BSD sockets used to program network applications. Defined at `/include/linux/net.h:110`

- `struct file *file`: File back pointer for gc
- `socket_state state`: socket state (%SS_CONNECTED, etc)
- `short type`: socket type (%SOCK_STREAM, etc)
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

superclass: `struct sock_common __sk_common` (inet_timewait_sock)

subclass:

- `struct inet_sock` defined at `/include/net/inet_sock.h:177`


struct sk_buff
{{ site.struct_style }}

the representation of a network packet and its status. Defined in `/include/linux/skbuff.h:665`

- `struct list_head	list`
- `struct sock *sk;`: Socket we are owned by
- `struct net_device *dev;`: Device we arrived on/are leaving by
- `unsigned char *head, *data`: Head of buffer; Data head pointer
- `sk_buff_data_t tail, end`: see `alloc_skb()` for details.
- `unsigned int truesize`: buffer size
- `char cb[48] __aligned(8)`: control buffer, that is free to use for every layer
  - UDP: `struct sock_skb_cb { u32 dropcount; }`

struct net_device
{{ site.struct_style }}

Defined at `/include/linux/netdevice.h:1747`

- `unsigned int mtu`
- `struct netdev_rx_queue *_rx`
- `possible_net_t nd_net;`
```c
typedef struct {
#ifdef CONFIG_NET_NS
	struct net *net;
#endif
} possible_net_t;
```

struct net
{{ site.struct_style }}

network namspace. Defined at `/include/net/net_namespace.h:51`

## UDP

IPPROTO_UDPLITE

<pre class="graphviz">

digraph {
  rankdir = BT
  node [shape=box]
//   concentrate=true
  
  __udp_enqueue_schedule_skb [fontcolor=blue]
  
  udp_rev -> udp_unicast_rcv_skb
  udp_unicast_rcv_skb -> __udp_queue_rcv_skb
  __udp_queue_rcv_skb -> __udp_enqueue_schedule_skb 
  __udp_queue_rcv_skb -> "sk_mark_napi_id(_once)" [color=grey]
  __udp_enqueue_schedule_skb -> skb_condense [color=grey]
  __udp_enqueue_schedule_skb -> sk_data_ready
}"

</pre>

## IP(v4)

struct net_protocol
{{ site.struct_style }}

Defined in `/include/net/protocol.h:41`. This is used to register protocols. `extern struct net_protocol __rcu *inet_protos[MAX_INET_PROTOS]`

- `int (*handler)(struct sk_buff *skb)`

example `/net/ipv4/af_inet.c:1694`:

```c
static struct net_protocol udp_protocol = {
	.early_demux =	udp_v4_early_demux,
	.early_demux_handler =	udp_v4_early_demux,
	.handler =	udp_rcv,
	.err_handler =	udp_err,
	.no_policy =	1,
	.netns_ok =	1,
};
```

## Netfilter

need to enable `CONFIG_NETFILTER`

the kernel interface for capturing network packets for modifying/analyzing them (for filtering, NAT, etc.). The netfilter interface is used in user space by `iptables`.

In the Linux kernel, packet capture using netfilter is done by attaching hooks. Hooks can be specified in different locations in the path followed by a kernel network packet, as needed. 

{% include img.html filename="nfk-traversal.png" %}

## xfrm4


## netcat / nc


