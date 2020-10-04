---
layout: default
title: Filesystem
parent: Computer System
nav_order: 50
---

# Filesystem
{: .no_toc }

Second Extended Filesystem

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

history:

- MINIX filesystem
- Extended filesystem, when Linux matured
- Ext2, 1994
- Ext3, widely used

```c
#include <sys/statvfs.h>
int statvfs(const char *pathname, struct statvfs *statvfsbuf);
int fstatvfs(int fd, struct statvfs *statvfsbuf);
```

## Ext2

features:

- may choose the block size (1024 ~ 4096 bytes)
- may choose the number of inodes for a partition of a given size
- disk block are partitioned into groups. Each group includes data blocks and inodes stored in adjacent tracks.
- preallocates disk data blocks for regular files
- support fast symbolic links
- consistency check by `e2fsck`

Ext2 **does not** support journalling.

## tmpfs

The tmpfs file system differs from other memory-based file systems in that it is a virtual memory file system. This means that tmpfs uses not only RAM, but also the swap space, if RAM is exhausted.

```bash
mount -t tmpfs source target
# source can be any name
```

## Mount

/proc/[pid]/mounts
{{ site.bin_option_style }}

All the filesystems currently mounted in the process's mount namespace.

/etc/fstab
{{ site.bin_option_style }}

Descriptive information about the filesystems the system can mount. Read-only.

Format: https://man7.org/linux/man-pages/man5/fstab.5.html

```
sysfs /sys sysfs rw,nosuid,nodev,noexec,relatime 0 0
<file system> <mount point>  <type>  <options>  <dump>  <pass>
```

/etc/mtab
{{ site.bin_option_style }}

system-specific options given to `mount`

umount
{{ site.bin_option_style }}

Specifies the mount point of the file system to be unmounted. It is not possible to unmount a file system that is busy; that is, if there are open files on the file system, or a process’s current working directory is somewhere in the file system.

mount
{{ site.bin_option_style }}

- Mounting a File System at Multiple Mount Points: changes made via one mount point are visible through the other(s)
- Stacking Multiple Mounts on the Same Mount Point: Each new mount hides the directory subtree previously visible at that mount point.
- Bind Mounts (`--bind`)  is somewhat like a hard link, but
  - It is possible to make a bind mount for a directory.
  - A bind mount can cross file-system mount points (and even chroot jails).
- Recursive version bind mounts (`--rbind`)

## chroot

How to break the jail:

- Calling chroot() doesn’t change the process’s current working directory. Thus, a call to chroot() is typically preceded or followed by a call to chdir() (e.g., chdir(“/”) after the chroot() call). If this is not done, then a process can use relative pathnames to access files and directories outside the jail.
- If a process holds an open file descriptor for a directory outside the jail, then
  the combination of fchdir() plus chroot() can be used to break out of the jail.
  - Using sendmsg() and recvmsg(), we can pass ancillary data containing a file descriptor from one process to another process on the same host via a UNIX domain socket.