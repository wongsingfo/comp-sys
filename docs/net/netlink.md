---
layout: default
title: Netlink
parent: Network Stack
nav_order: 20
---

# Netlink

Netlink is a IPC mechanism primarly between the kernel and user space processes. It was designed to be a more flexible successor to ioctl to provide mainly networking related kernel configuration and monitoring interfaces.

- [libnl library](http://www.infradead.org/~tgr/libnl/)
- [netlink(7)](http://man7.org/linux/man-pages/man7/netlink.7.html)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

{% include img.html filename="layer_diagram.png" %}

## Generic Netlink Protocol

- [generic_netlink_howto](https://wiki.linuxfoundation.org/networking/generic_netlink_howto)

```
  0                   1                   2                   3
  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |                Netlink message header (nlmsghdr)              |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |           Generic Netlink message header (genlmsghdr)         |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |             Optional user specific message header             |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |           Optional Generic Netlink message payload            |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### example: dropwatch

Operations defined at `include/uapi/linux/net_dropmon.h` and the module `/net/core/drop_monitor.c`
https://lwn.net/Articles/379903/
Check http://lwn.net/Articles/379903,
      http://lwn.net/Articles/381064 and http://lwn.net/Articles/383362

## Netfilter

- [Netfilter](http://www.netfilter.org/)


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





