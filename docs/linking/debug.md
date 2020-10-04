---
layout: default
title: Debugging
parent: Linking
nav_order: 20
---

# Debugging
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

resources:

- https://binary.ninja/ Reversing Platform
- https://www.godbolt.org/

## GCC options

-g
{{ site.bin_option_style }}

include debugging information in the compiled program

-funwind-tables
{{ site.bin_option_style }}

It generates any needed static data for exception handling and allows a running program to walk back the function call stack from a given execution point.

### Strip Debugging Info

-fomit–frame–pointer
{{ site.bin_option_style }}

strip(1)
{{ site.bin_option_style }}

## proc/pid/maps

https://man7.org/linux/man-pages/man5/proc.5.html

```
address           perms offset  dev   inode       pathname
00400000-00452000 r-xp 00000000 08:02 173521      /usr/bin/dbus-daemon
```

- perms: (`s/p`) shared / private
- pseudo-paths
  - `[stack]`: The main thread stack
  - `[stack:<tid>]` (remove in Linux 4.5): A thread's stack
  - `[vdso]`: virtual dynamically linked shared object
  - `[heap]`
  - blank: anonymous mapping

## Core file

```bash
# the core filesize is limited by RLIMIT_CORE
ulimit -c unlimited
```

`/proc/PID/coredump_filter`: determine which types of memory mappings are written. See core(5)

`Elf32_Ehd.e_type == ET_CORE`

```bash
gdb program core
objdump -s core    # (s: full-content)
readelf -a core    # (all)
```

## TODO

DWARF
Debug With Arbitrary Record Format 
http://www.dwarfstd.org/

STABS debugging info
http://sourceware.org/gdb/onlinedocs/stabs.html

