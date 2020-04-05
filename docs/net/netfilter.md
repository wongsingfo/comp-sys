---
layout: default
title: Netfilter
parent: Network Stack
nav_order: 20
---

# Netfilter

Reference:

- [Netfilter](http://www.netfilter.org/)

Packet filtering framework inside the Linux 2.4.x and later. It includes:

- netfilter: a set of hooks inside the Linux kernel that allows kernel modules to register callback functions with the network stack.
- iptables: a generic table structure for the definition of rulesets (matches + actions).
- connection tracking (ip_conntrack, nf_conntrack)
- NAT subsystem


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