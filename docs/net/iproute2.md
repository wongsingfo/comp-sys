---
layout: default
title: iproute2
parent: Network Stack
nav_order: 20
---

# iproute2
{: .no_toc }

The 2.2 and above Linux kernels include a completely redesigned network subsystem. This new networking code brings Linux performance and a feature set with little competition in the general OS arena.

References:

- Linux Advanced Routing & Traffic Control HOWTO. [link1](https://www.net.t-labs.tu-berlin.de/teaching/ss08/RL_labcourse/docs/08-lartc.pdf)
- [Cheat Sheet](https://baturin.org/docs/iproute2/)

wrappers for iproute2: `ifconfig`, `route`

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}


## ip

Show the ARP table using `ip neigh`.

There are several routing tables in the system (listed in `/etc/iproute2/rt_tables`). We can use `ip rule` to create rule and the traffic that matches the rule will be routed according to the table with specified `name/id` instead of the `"main"/254` table.

`via [ip]` is a hint for searching the egressing device `dev [dev]`.


```bash
ip addr # Show information for all IP addresses
ip addr show dev lo # Display information only for device lo
ip addr add 192.168.1.1/24 dev em1
ip addr del 192.168.1.1/24 dev em1

ip link # Show information for all interfaces
ip link set em1 mtu 9000
ip link set em1 down / up

ip neigh # Display neighbour objects, i.e., ARP tables
ip neigh add 192.168.1.1 lladdr 1:2:3:4:5:6 dev em1
ip neigh del 192.168.1.1 dev em1

route -n  # list routing table (not replace ip with hostname)
ip route  # list routing table
ip route add 192.168.1.0/24 via 192.168.1.1
ip route add 192.168.1.0/24 dev em1
ip route get 192.168.1.5 # Display the route taken for IP 192.168.1.5
ip route flush cache

ip netns # process network namespace management
ip netns add NETNSNAME
ip netns attach NETNSNAME PID
ip [-all] netns del [ NETNSNAME ]
ip netns exec vpn ip link set lo up # Bring up the loopback interface

ip link add ve_A type veth peer name ve_B
ip link: ethtool -S ve_A  # Discover interface index of peer
```

## tc

QoS management

source code: `net/sched/sch_api.c`

qdisc (queueing discipline):

There exists a queue for each interface. The kernel first sends the packet to the qdisc, and then tries to get as many packets as possible from the qdisc, for giving them to the interface. qdisc can contain *classes*. 

Each interface has one egress *root qdisc* (default: `pfifo_fast`)

A classful qdisc allows you to have branches. The branches are called *classes*. 

Although tc shaping rules for ingress are very limited, you can create a virtual interface ifb.

A *filter* is used by a classful qdisc to determine in which class a packet will be enqueued. 

- The available filters are bpf, cgroup, basic, etc. 
  Classes form a tree
- The classless qdisc are choke, netem, tbf (Token Bucket), ingress (a special qdisc as it applies to incoming traffic on an interface) 
  Classless qdiscs are only be attached at the root of a device
- classful qdisc: htb(Hierarchy Token Bucket)

```
tc qdisc list

tc qdisc add dev DEV root QDISC QDISC-PARAMETERS
tc qdisc del dev DEV root # or, tc qdisc del root dev eth0
tc -g class show dev eth0  # Shows classes as ASCII graph on eth0 interface.
tc -d -s qdisc show dev eth0  # dump stat

modprobe sch_netem
```

Each qdisc and class is assigned a handle. To name a qdisc, the `handle` parameter is used. To name a class, the `classid` parameter is used. 

```
$ tc qdisc add dev eth0 root handle 1: my_qdisc <args>

$ tc qdisc add dev eth0 root handle 1: my_qdisc1 <args>
$ tc qdisc add dev eth0 parent 1: handle 2: my_qdisc2 <args>

$ tc qdisc add dev eth0 root handle 1: classful_qdisc <args>
$ tc class add dev eth0 parent 1: classid 1:1 myclass <args>
$ tc class add dev eth0 parent 1: classid 1:2 myclass <args>
$ tc qdisc add dev eth0 parent 1:2 handle 20: my_qdisc2 <args>
```

{% include img.html filename="Screen Shot 2020-04-17 at 10.50.11 PM.png" %}

Only the root qdisc gets dequeued by the kernel! When the kernel decides that it needs to extract packets to send to the interface, the root qdisc 1: gets a dequeue request, which is passed to 1:1, which is in turn passed to 10:, 11: and 12:, each of which queries its siblings, and tries to dequeue() from them. In this case, the kernel needs to walk the entire tree, because only 12:2 contains a packet.

name:

- root: `ffff:ffff` or `1:0`
- unspecified: `0000:0000`
- qdisc:
  - major number is called handle
  - minor number is left for classed

```
tc filter add dev eth0 protocol ip parent 1: prio 1 u32 match ip dport 22 0xffff flowid 1:10
tc filter add dev eth0 parent 1: protocol ip prio 2 u32 match ip src 4.3.2.1/32 match ip sport 80 0xffff flowid 1:11

# 0xffff is a mask to the port number

# tc + iptables
tc filter add dev eth0 protocol ip parent 1: prio 1 handle 6 fw flowid 1:30
iptables -A PREROUTING -t mangle -i eth0 -j MARK --set-mark 6
```

## ifb

[Lnux Foudnation Docs](https://wiki.linuxfoundation.org/networking/ifb)

The Intermediate Functional Block (`ifb`) pseudo network interface acts as a QoS concentrator for multiple different sources of traffic. Packets from or to other interfaces have to be redirected to it using the `mirred` action in order to be handled, regularly routed traffic will be dropped. This way, a single stack of qdiscs, classes and filters can be shared between multiple interfaces.

```bash
# Add the IFB interface
modprobe ifb numifbs=1
ip link set dev $IFB up

# Redirect ingress (incoming) to egress ifb0
tc qdisc add dev $IFACE handle ffff: ingress
tc filter add dev $IFACE parent ffff: protocol ip u32 match u32 0 0 \
action mirred egress redirect dev $IFB
# or,
tc filter add dev $IFACE parent ffff:           \
                      matchall skip_sw                      \
                      action mirred egress mirror           \
                      dev $IFB

### Then, 
### Solution 1

# Add class and rules for virtual
tc qdisc add dev $IFB root handle 2: htb
tc class add dev $IFB parent 2: classid 2:1 htb rate ${DSPEED}kbit

# Add filter to rule for IP address
tc filter add dev $IFB protocol ip parent 2: prio 1 u32 match ip src 0.0.0.0/0 flowid 2:1

### Solution 2

tc qdisc add dev ifb0 root handle 1: htb default 10
tc class add dev ifb0 parent 1: classid 1:1 htb rate 1mbit
tc class add dev ifb0 parent 1:1 classid 1:10 htb rate 1mbit
```

Incoming packets enter the system via *ifb0*, while corresponding replies leave directly via *eth0*. This can be observed using `tcpdump`on *ifb0*, which shows the input part of the traffic only.

`tcpdump` catches the packets to dump before they enter the ingress qdisc, so `tcpdump` on *eth0* shows both incoming and outgoing traffic.

```c
drivers/net/ifb.c:

static int numifbs = 2;
module_param(numifbs, int, 0);
MODULE_PARM_DESC(numifbs, "Number of ifb devices");
```


