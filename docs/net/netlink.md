---
layout: default
title: Netlink
parent: Network Stack
nav_order: 20
---

# Netlink
{: .no_toc}

Netlink is a IPC mechanism primarly between the kernel and user space processes. It was designed to be a more flexible successor to ioctl to provide mainly networking related kernel configuration and monitoring interfaces. It uses the `AF_NETLINK` address family. 

- [libnl library](http://www.infradead.org/~tgr/libnl/) Documentation

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

{% include img.html filename="layer_diagram.png" %}

## Netlink Core

### netlink header

- total length: 32 bits
- message type 16 bits
  - standard:  prefix `NLMSG_`, NOOP, ERROR, DONE, OVERRUN
    - error message includes error code and the original message header after the netlink header
      - ACK message is a special type of error, with error code set to 0.
    - multipart message: A multipart message has the flag `NLM_F_MULTI` set and the receiver is expected to continue receiving and parsing until the special message type `NLMSG_DONE` is received.
  - custom: > `NLMSG_MIN_TYPE = 0x10`
- message flags: 16 bits
  - `NLM_F_ACK`: request ACK
  - `NLM_F_REQUEST`: message is a request
  - `NLM_F_EXCL` - Do not update object if it exists already.
- seq number: 32 bits
  - The library will automatically take care of sequence number handling for the application.
- port number: use PID (common practice). use 0 at the kernel side.

### netlink socket

```c
struct nl_sock *nl_socket_alloc(void);
void nl_socket_free(struct nl_sock *sk);

void nl_connect(const struct nl_sock *sk, NETLINK_ROUTE);

int nl_socket_get_fd(const struct nl_sock *sk);
int nl_socket_set_nonblocking(const struct nl_sock *sk);

nl_send_auto(sk, struct nl_msg msg) 
    => nl_complete_msg(sk, msg) + nl_send(sk, msg)
int nl_send_simple(struct nl_sock *sk, int type, int flags,
                   void *buf, size_t size);
	=> nl_send_auto
        
nl_recvmsgs_default(sk)
    => nl_recvmsgs(sk, cb)
    => nl_recv() 
```

### Attributes

Any form of payload should be encoded as netlink attributes whenever possible so as not to break binary compatibility.

### CMSG

man [netlink(7)](http://man7.org/linux/man-pages/man7/netlink.7.html), [cmsg(3)](https://man7.org/linux/man-pages/man3/cmsg.3.html)

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

include/net/genetlink.h

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

### register a family

```c
/* family definition */
static struct genl_family net_drop_monitor_family __ro_after_init = {
    // assign the channel number when we register the family
    .id             = 0, 
	.hdrsize        = 0,
	.name           = "NET_DM",
	.version        = 2,
	.module		= THIS_MODULE,
    
    // or use genl_register_ops(&net_drop_monitor_family, &dropmon_ops); to register
	.ops		= dropmon_ops,
	.n_ops		= ARRAY_SIZE(dropmon_ops),
	.mcgrps		= dropmon_mcgrps,
	.n_mcgrps	= ARRAY_SIZE(dropmon_mcgrps),
};

/* operation definition */
static const struct genl_ops dropmon_ops[] = {
	{
		.cmd = NET_DM_CMD_CONFIG,
		.doit = net_dm_cmd_config,
	},
	{
		.cmd = NET_DM_CMD_START,
		.doit = net_dm_cmd_trace,
	},
	{
		.cmd = NET_DM_CMD_STOP,
		.doit = net_dm_cmd_trace,
	},
};

genl_register_family(&net_drop_monitor_family);
```



### example: dropwatch

Operations defined at `include/uapi/linux/net_dropmon.h` and the module `/net/core/drop_monitor.c`

Check http://lwn.net/Articles/379903, http://lwn.net/Articles/381064 and http://lwn.net/Articles/383362

```c
// userspace
int disable_drop_monitor()
{
	struct netlink_message *msg;

	msg = alloc_netlink_msg(NET_DM_CMD_STOP, NLM_F_REQUEST|NLM_F_ACK, 0);

	if (monitor_sw && nla_put_flag(msg->nlbuf, NET_DM_ATTR_SW_DROPS))
		goto nla_put_failure;

	if (monitor_hw && nla_put_flag(msg->nlbuf, NET_DM_ATTR_HW_DROPS))
		goto nla_put_failure;

	set_ack_cb(msg, handle_dm_stop_msg);

	return send_netlink_message(msg);

nla_put_failure:
	free_netlink_msg(msg);
	return -EMSGSIZE;
}

// kernel
static void trace_drop_common(struct sk_buff *skb, void *location)
{
	struct net_dm_alert_msg *msg;
	struct nlmsghdr *nlh;
	struct nlattr *nla;
	int i;
	struct sk_buff *dskb;
	struct per_cpu_dm_data *data;
	unsigned long flags;

	local_irq_save(flags);
	data = this_cpu_ptr(&dm_cpu_data);
	spin_lock(&data->lock);
	dskb = data->skb;

	if (!dskb)
		goto out;

	nlh = (struct nlmsghdr *)dskb->data;
	nla = genlmsg_data(nlmsg_data(nlh));
	msg = nla_data(nla);
	for (i = 0; i < msg->entries; i++) {
		if (!memcmp(&location, msg->points[i].pc, sizeof(void *))) {
			msg->points[i].count++;
			goto out;
		}
	}
	if (msg->entries == dm_hit_limit)
		goto out;
	/*
	 * We need to create a new entry
	 */
	__nla_reserve_nohdr(dskb, sizeof(struct net_dm_drop_point));
	nla->nla_len += NLA_ALIGN(sizeof(struct net_dm_drop_point));
	memcpy(msg->points[msg->entries].pc, &location, sizeof(void *));
	msg->points[msg->entries].count = 1;
	msg->entries++;

	if (!timer_pending(&data->send_timer)) {
		data->send_timer.expires = jiffies + dm_delay * HZ;
		add_timer(&data->send_timer);
	}

out:
	spin_unlock_irqrestore(&data->lock, flags);
}
```

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





