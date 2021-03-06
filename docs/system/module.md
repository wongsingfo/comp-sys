---
layout: default
title: Kernel Modules
parent: Computer System
nav_order: 11
---

# Kernel Modules
{: .no_toc }


reference: 

- [The Linux Kernel Module Programming Guide](http://tldp.org/LDP/lkmpg/2.6/html/lkmpg.html) [recommended]
- Documentation/kbuild/modules
- [stackoverflow: add-a-linux-kernel-driver-module-as-a-buildroot-package](https://stackoverflow.com/questions/40307328/how-to-add-a-linux-kernel-driver-module-as-a-buildroot-package/43874273#43874273)


## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

The object files are placed in `/lib/modules/2.6.12/`. In the same directory, there exists:

- `modules.pcimap`, `modules.submap`: PCI and USB IDs of the devices supported by the kernel and a reference to the associated kernel module.
- `modules.dep`: dependency graph

```bash
# list
lsmod
# try to load from /lib/modules/(kernel version)/kernel/drivers 
#  and the dependencies by calling `insmod` incursively
modprobe bluetooth
# remove
modprobe -r bluetooth

# edit /etc/modprobe.d/ to load and not to load on bootup
```

## In-Tree and Out-of-Tree

From Stackoverflow:

"in-tree" and "out-of-tree" are actually generic software development terms. It refers to where the resulting build output/artifacts are placed during a compile, either "in-tree", right next to the files they come from, or "out-of-tree", in a separate root directory that separates the build output from the source files. 

I have not come across "in-tree" and "out-of-tree" outside of the Linux kernel source development and then only for working with modules. All modules start out as "out-of-tree" developments, that can be compiled using the context of a source-tree. Once a module gets accepted to be included, it becomes an in-tree module.

## Building Modules

```bash
# prepare a kernel source tree
# but a full kernel build needs to be executed to make module versioning work.
make modules_prepare 

make -C /lib/modules/`uname -r`/build M=$PWD modules
make -C /lib/modules/`uname -r`/build M=$PWD modules_install
make -C /lib/modules/`uname -r`/build M=$PWD clean
make -C /lib/modules/`uname -r`/build M=$PWD help
```

