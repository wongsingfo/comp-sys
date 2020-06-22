---
layout: default
title: Virtual Devices
parent: Network Stack
nav_order: 20
---

# Virtual Devices
{: .no_toc }

References:

- [readhat tutorial](https://developers.redhat.com/blog/2018/10/22/introduction-to-linux-interfaces-for-virtual-networking/#:~:text=Bonded interface,standby or load balancing services.)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## tap / tun

- tap: link layer (like raw socket)
- tun: network layer (ip packets)

```c
fd = open("/dev/net/tun", O_RDWR)
 /* Flags: IFF_TUN   - TUN device (no Ethernet headers)
  *        IFF_TAP   - TAP device
  *        IFF_NO_PI - Do not provide packet information
  */
ifr.ifr_flags = IFF_TUN | IFF_NO_PI;
ioctl(fd, TUNSETIFF, (void *) &ifr)
```

## Bridge

```bash
ip link add br0 type bridge
ip link set eth0 master br0
ip link set tap1 master br0
ip link set tap2 master br0
ip link set veth1 master br0
```

## Bonding

bundle a set of interfaces and make them look like a single one. Traffic can be distributed between them. Documentation `/networking/bonding.txt`

```bash
ip link add bond1 type bond miimon 100 mode active-backup
# miimon: Specifies the MII link monitoring frequency in milliseconds. This determines how often the link state of each slave is inspected for link failures.
ip link set eth0 master bond1
ip link set eth1 master bond1
```

## VLAN

820.1Q protocol: Preamble + Dest MAC + Src MAC + VLAN related + EtherType + Data + CRC

When configuring a VLAN, you need to make sure the switch connected to the host is able to handle VLAN tags, for example, by setting the switch port to trunk mode.

```bash
ip link add link eth0 name eth0.2 type vlan id 2
ip link add link eth0 name eth0.3 type vlan id 3
```

