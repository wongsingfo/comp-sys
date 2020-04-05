---
layout: default
title: Netlink
parent: Network Stack
nav_order: 20
---

# Netlink
{: .no_toc}

Netlink is a IPC mechanism primarly between the kernel and user space processes. It was designed to be a more flexible successor to ioctl to provide mainly networking related kernel configuration and monitoring interfaces.

- [libnl library](http://www.infradead.org/~tgr/libnl/)
- [netlink(7)](http://man7.org/linux/man-pages/man7/netlink.7.html)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

{% include img.html filename="layer_diagram.png" %}


## Message

{% include img.html filename="Screen Shot 2020-03-27 at 2.18.52 PM.png" %}

{% include img.html filename="unnamed.gif" %}

```c
struct msghdr mhdr;
struct iovec iov[1];
struct cmsghdr *cmhdr;
char control[1000];
struct sockaddr_in sin;
char databuf[1500];
unsigned char tos;

mhdr.msg_name = &sin
mhdr.msg_namelen = sizeof(sin);
mhdr.msg_iov = iov;
mhdr.msg_iovlen = 1;
mhdr.msg_control = &control;
mhdr.msg_controllen = sizeof(control);
iov[0].iov_base = databuf;
iov[0].iov_len = sizeof(databuf);
memset(databuf, 0, sizeof(databuf));
if ((*len = recvmsg(sock, &mhdr, 0)) == -1) {
    perror("error on recvmsg");
    exit(1);
} else {
    cmhdr = CMSG_FIRSTHDR(&mhdr);
    while (cmhdr) {
        if (cmhdr->cmsg_level == IPPROTO_IP && cmhdr->cmsg_type == IP_TOS) {
            // read the TOS byte in the IP header
            tos = ((unsigned char *)CMSG_DATA(cmhdr))[0];
        }
        cmhdr = CMSG_NXTHDR(&mhdr, cmhdr);
    }
    printf("data read: %s, tos byte = %02X\n", databuf, tos); 
}
```

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

Check http://lwn.net/Articles/379903, http://lwn.net/Articles/381064 and http://lwn.net/Articles/383362

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





