---
layout: default
title: Netfilter
parent: Network Stack
nav_order: 20
---

# Netfilter

Reference:

- [Netfilter](http://www.netfilter.org/)
- [Tutorial](https://www.digitalocean.com/community/tutorials/a-deep-dive-into-iptables-and-netfilter-architecture)

{: .no_toc}

Netfilter is the kernel interface for capturing network packets for modifying/analyzing them (for filtering, NAT, etc.). The netfilter interface is used in user space by `iptables`.

Packet filtering framework inside the Linux 2.4.x and later. It includes:

- netfilter: a set of hooks inside the Linux kernel that allows kernel modules to register callback functions with the network stack.
- iptables: a generic table structure for the definition of rulesets (matches + actions).
- connection tracking (ip_conntrack, nf_conntrack)
- NAT subsystem

Need to enable `CONFIG_NETFILTER`.

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Structure

- table: filter, nat, mangle
  - chains
    - rules

A packet enters evaluation based on its type:

- Incoming packets destined for the local system: `PREROUTING` -> `INPUT`
- Incoming packets destined to another host: `PREROUTING` -> `FORWARD` -> `POSTROUTING`
- Locally generated packets: `OUTPUT` -> `POSTROUTING`

Certain events will cause a table’s chain to be skipped during processing. For instance, only the first packet in a connection will be evaluated against the NAT rules. Any `nat` decisions made for the first packet will be applied to all subsequent packets in the connection without additional evaluation. Responses to NAT'ed connections will automatically have the reverse NAT rules applied to route correctly.

{% include img.html filename="nfk-traversal.png" %}

| Tables↓/Chains→               | PREROUTING | INPUT | FORWARD | OUTPUT | POSTROUTING |
| ----------------------------- | :--------: | :---: | :-----: | :----: | :---------: |
| (routing decision)            |            |       |         |   ✓    |             |
| **raw**                       |     ✓      |       |         |   ✓    |             |
| (connection tracking enabled) |     ✓      |       |         |   ✓    |             |
| **mangle**                    |     ✓      |   ✓   |    ✓    |   ✓    |      ✓      |
| **nat** (DNAT)                |     ✓      |       |         |   ✓    |             |
| (routing decision)            |     ✓      |       |         |   ✓    |             |
| **filter**                    |            |   ✓   |    ✓    |   ✓    |             |
| **security**                  |            |   ✓   |    ✓    |   ✓    |             |
| **nat** (SNAT)                |            |   ✓   |         |        |      ✓      |

Tables:

- raw / conntrack: has a very narrowly defined function. Its only purpose is to provide a mechanism for marking packets in order to opt-out of connection tracking. The connection tracking features are built on this table. Packets that have been marked with the `NOTRACK` target in one of the `raw` chains will bypass the connection tracking routines.
- mangle: alter the IP headers (e.g., modify TTL, or place an internal kernel “mark” on the packet for further processing)
- nat: determine whether and how to modify the packet’s source or destination addresses
- filter: make decisions about whether to let a packet continue
- security: used to set internal SELinux security context marks on packets

## Hook

There are five well-defined points in the networking stack: `NF_IP_PRE_ROUTING`, `NP_IP_LOCAL_IN`, `NP_IP_FORWARD`, `NP_IP_LOCAL_OUT`, `NP_IP_POST_ROUTING`. The name of the `iptable` built-in chains mirror the name of the hooks.

Kernel modules that wish to register at these hooks must

- provide a priority number
- return a decision to the `netfilter` framework that indicates what should be done with the packet (when called).


```c
#include <linux/netfilter.h>
#include <linux/netfilter_ipv4.h>
#include <linux/net.h>
#include <linux/in.h>
#include <linux/skbuff.h>
#include <linux/ip.h>
#include <linux/tcp.h>

static unsigned int my_nf_hookfn(void *priv,
              struct sk_buff *skb,
              const struct nf_hook_state *state)
{
      /* process packet */
      //...

      return NF_ACCEPT;
}

static struct nf_hook_ops my_nfho = {
      .hook        = my_nf_hookfn,
      .hooknum     = NF_INET_LOCAL_OUT,
      .pf          = PF_INET,
      .priority    = NF_IP_PRI_FIRST
};

int __init my_hook_init(void)
{
      return nf_register_net_hook(&init_net, &my_nfho);
}

void __exit my_hook_exit(void)
{
      nf_unregister_net_hook(&init_net, &my_nfho);
}

module_init(my_hook_init);
module_exit(my_hook_exit);
```

## Tracking System

states: 

- NEW: a new connection will be added to the system with this label. This happens for both connection-aware protocols like TCP and for connectionless protocols like UDP.
- ESTABLISHED: when it receives a valid response in the opposite direction. For TCP connections, this means a `SYN/ACK` and for UDP and ICMP traffic, this means a response where source and destination of the original packet are switched.
- RELATED: packets that are not part of an existing connection, but are associated with a connection already in the system. FTP data transmission connections, or it could be ICMP responses to connection attempts by other protocols.
- INVALID: not associated with an existing connection and aren’t appropriate for opening a new connection
- UNTRACKED: Packets that have been marked with the `NOTRACK` target in one of the `raw` chains
- SNAT: A virtual state set when the source address has been altered by NAT operations. This is used by the connection tracking system so that it knows to change the source addresses back in reply packets.
- DNAT

## Cheat Sheet

```bash
iptables -t table -A chain specifiers -j target
iptables -t table -N chain # create new chain
iptables -t table -F chain # remove all rules in the chain
iptables -t table -X chain # delete the chain
```

| Specifier | Meaning                            |
| --------- | ---------------------------------- |
| -s ADDR   | Packet came from source ADDR       |
| -d ADDR   | Packet is going to ADDR            |
| -i IFACE  | Packet came from interface IFACE   |
| -o IFACE  | Packet will leave through IFACE    |
| -m COND   | Packet matches the condition COND. |
| -p PROTO  | Packet uses the protocol PROTO     |

| Target                     | table  | Meaning                                                      | Terminate |
| -------------------------- | ------ | ------------------------------------------------------------ | --------- |
| ACCEPT                     | filter | Accept this packet.                                          | y         |
| DROP                       | filter | Ignore this packet. The sender gets no notification.         | y         |
| REJECT                     | filter | Reject this packet, and send an icmp message back to the sender to indicate that this packet died. | y         |
| SNAT --to-source ADDR      | nat    | Change the source address of this packet to ADDR.            | y         |
| DNAT --to-destination ADDR | nat    | Change the destination address of this packet to ADDR.       | y         |
| LOG                        | any    | Log this packet to syslog.                                   | n         |
| *CHAIN*                    | any    | Punt processing of this packet to *CHAIN*. Terminates if *CHAIN* contains a terminating rule that matches this packet. (Like a function call , except that the callee may use `exit()`  rather that `return`) | y / n     |

```bash
-i eth0
-p tcp --sport 32768:61000 --dport 80 
-m owner # load module owner
		\! --uid-owner userid

iptables -t nat -A OUTPUT 
	-p tcp --dport 80 
	-m owner --gid-owner 10033 
	-j REDIRECT --to-ports 9090
	
iptables -t nat -A OUTPUT 
	-p tcp --sport 32768:61000 --dport 80 
	-m owner --gid-owner 10165 
	-j DNAT --to-destination 127.0.0.1:9090
```

