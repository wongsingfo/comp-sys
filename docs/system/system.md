---
layout: default
title: Computer System
nav_order: 20
permalink: docs/system
has_children: true
---


# Computer System 

## References

- [Tutorial: linuxjourney](https://linuxjourney.com/)
- O'Reilly series:
  - Understanding Linux Kernel
  - Understanding Linux Network Internals
  - Linux Device Drivers
- The Linux Programming Interface
- INTEL 80386 PROGRAMMER'S REFERENCE MANUAL 1986
- Intel® 64 and IA-32 Architectures Software Developer’s Manual Volume 3A: System Programming Guide, Part 1
- [The Linux Development Project](http://www.tldp.org/)
- [MIT 6.828](https://pdos.csail.mit.edu/6.828/2018/schedule.html)
- [Linux Kernel Labs](https://linux-kernel-labs.github.io/)
- [Linux Kernel Source Code](https://www.kernel.org/)
- [Linux Kernel Documentation 4.19](https://www.kernel.org/doc/html/v4.19/doc-guide/sphinx.html), [latest](https://www.kernel.org/doc/html/latest/index.html)
- [woboq](https://code.woboq.org/linux)

## Kernel

- Written in GNU C and the GNU toolchain.
- Adheres to ISO C89 standard and some extensions
  - sometimes difficul to understand the assumptions the kernel has on the toolchain and the extensions and unfortunately there is no definitive reference :(

## Linux

User interface: 

- `/proc` procfs: usually expose complex data and the data are read-only
  - `net/[dev|dev_mcast|wireless]`: created by `net_[dev|proc]_init`; displays statistics
- `/proc/sys` sysctl: usually expose simple data
  - `kernel/[modprobe]`: change the default path to user-space helpers
- `/sys` After 2.6, a newer filesystem compared with procfs and sysctl
  - can configure module options; `/sys/module/sis900/parameters/`
- `/var`: valuable data. e.g. system logs, website content
- `ioctl` work with socket. It is processed by kernel in many different places
  - `ethtool`, `ifconfig` are based on `ioctl`
- netlink: a newer interface
- User-space helpers:
  - `/sbin/modprobe`: kernel module loader that allows kernel components to request the load.
    - `/etc/modprobe.conf` is the configuration file.
    - `/etc/modules`: modules loaded at boot time
  - `/sbin/hotplug` 

## Boot

### Option

- options of the new option infrastructure are divied into two classes. There are two calls to `parse_args` and each call takes care of one class. `linux/init.h` provides  `__setup_param` wrapper for these classes.
  - early options: `early_param("keyword=", function_handler)`
  - default options: register a keyword and the handler: `__steup("keyword=", function_handler)`
- options are pass through until being accepted
  - early options
  - default options
  - Old option infrastructure
  - as arg or env to `init` program
- The new option infrastructure exposed to `/sys`

### initcall

1. `init/main.c`: initialzation of various critical subsystems
2. other kernel components that do not need a strict order (`do_initcalls()`). But still, the higher priority (mark as `[core|postcore|arch|subsys|fs|device|late]_initcall`) is initilized first.
   - `__init` macro: routines that are not needed anymore at the end of the boot phase
   - `__initcall` (or with prioirity `xxx_initcall`) and `__exitcall`. They are often wrapped by `module_[init|exit]`.
   - `module_exit` are never executed when the associated modules are included statically in the kernel. Therefore, in this case, there is no need to include `module_exit` routines into the kernel image.

### Steps for booting

- PC powers on, BIOS initializes hardwares.
- BIOS load the first 512-byte sector of the boot disk at `0x7c00`
- BIOS transfer control to boot loader 
  - `%ip=0x7c00, %cs=0 `
  - in real mode 16bits: linear address (20bits) = selector x 16 + offset 
- boot loader: 
  - sets up *segment descriptor table* `gdt`, enters **protected mode** (since 80286)
    all segments have a base address of zero and the maximum possible limit. The table has a null entry, one entry for executable code, and one entry to data (only 3 entries). The loader also sets segment selectors `fs,gs / cs / ds,es,ss` to `0 / 8 / 16` accordingly.
  - Now, we evolved from 8088 to 80386 (32bit mode)
  - loads kernel (ELF format) from disk (at `1MB` plus a few bytes) and executes kernel starting at `_start`

- set up `entry_pgdir` (cr3)

- turn on paging (cr0)


## Process

- lightweight process (LWP)
  - process descriptor: `mm_struct, tty_struct, fs_struct, signal_struct, files_struct`
  - each LWP is associated with a Kernel stack
  - Created by `clone()`  (handled by `do_fork()` function)
    - `fork()` is implemented as `clone()` with `SIGCHLD` signal and all clone flags cleared and whose `child_stack` is equal to the current parent stack pointer.
    - `vfork()` is implemented as `clone()` with `SIGCHLD` signal and the flags `CLONE_VM, CLONE_VFORK`  set (`CLONE_VM` means to share the memory descriptor and page table, `CLONE_VFORK` means to insert the parent process in a wait queue and suspends it until the child releases its memory address space (that is, untail the child either teminates or executes a new program) ),  and whose `child_stack` is equal to the current parent stack pointer.
- thread group = a set of LWPs
  - act as a whole with regards to `kill()`, `_exit()` ...

POSIX-compliant pthread library

- Older version: a multithreaded application is just a normal process. The scheduling happens in User mode.
- Use LWP

## Tools

- [netcat](https://en.wikipedia.org/wiki/Netcat), [doc](http://man7.org/linux/man-pages/man1/ncat.1.html)
- [automake tutorial](https://thoughtbot.com/blog/the-magic-behind-configure-make-make-install)

## Resources

- [install GNU GCC](http://mirror.hust.edu.cn/gnu/gcc/)
- [Arch Linux packages](https://www.archlinux.org/packages/): to see what configure parameters a package uses (assume they are using autotools for the build system)
