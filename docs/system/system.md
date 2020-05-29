---
layout: default
title: Computer System
nav_order: 20
permalink: docs/system
has_children: true
---


# Computer System 

## References

- O'Reilly series:
  - Understanding Linux Kernel
  - Understanding Linux Network Internals
  - Linux Device Drivers
- INTEL 80386 PROGRAMMER'S REFERENCE MANUAL 1986
- Intel® 64 and IA-32 Architectures Software Developer’s Manual Volume 3A: System Programming Guide, Part 1
- [The Linux Development Project](http://www.tldp.org/)
- [MIT 6.828](https://pdos.csail.mit.edu/6.828/2018/schedule.html)
- [Linux Kernel Labs](https://linux-kernel-labs.github.io/)
- [Linux Kernel Source Code](https://www.kernel.org/)
- [Linux Kernel Documentation 4.19](https://www.kernel.org/doc/html/v4.19/doc-guide/sphinx.html), [latest](https://www.kernel.org/doc/html/latest/index.html)
- [woboq](https://code.woboq.org/linux)

## Linux

User interface: 

- `/proc` procfs: usually expose complex data and the data are read-only
- `/proc/sys` sysctl: usually expose simple data
- `/sys` After 2.6, a newer filesystem compared with procfs and sysctl
- `ioctl` work with socket. It is processed by kernel in many different places
- netlink

## Tools

- [netcat](https://en.wikipedia.org/wiki/Netcat), [doc](http://man7.org/linux/man-pages/man1/ncat.1.html)
- [automake tutorial](https://thoughtbot.com/blog/the-magic-behind-configure-make-make-install)

## Resources

- [install GNU GCC](http://mirror.hust.edu.cn/gnu/gcc/)
- [Arch Linux packages](https://www.archlinux.org/packages/): to see what configure parameters a package uses (assume they are using autotools for the build system)
