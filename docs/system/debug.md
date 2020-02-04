---
layout: default
title: Debug the Linux
parent: Computer System
nav_order: 20
---

# Debug the Linux
{: .no_toc }


## qemu

[command line option](https://www.qemu.org/docs/master/qemu-doc.html#disk_005fimages):

- kernel bzImage: Use bzImage as kernel image. The kernel can be either a Linux kernel or in multiboot format.

`ctrl+a` + :

- `c`: enter control plane
- `x`: exit

info:

- qtree: show the bus
- mtree: memory-mapped I/O
- network
- pci