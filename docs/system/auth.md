---
layout: default
title: Administration
parent: Computer System
nav_order: 0
---

# Administration in Linux
{: .no_toc }

Reference: 

- Secure Programming Cookbook for C and C++: Recipes for Cryptography, Authentication, Input Validation & More - John Viega and Matt Messier
- [Linux Performance Analysis in 60s](http://www.brendangregg.com/blog/2015-12-03/linux-perf-60s-video.html)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Service

```bash
service [service_name]
systemctl disable [service_name]
```

## System Log

There is a **service** called `syslog` that sends messages to the system logger. The logs are kept in `/var/log/syslog`.

The `syslogd` **system logger daemon** (or `rsyslogd` in newer Linux) waits for event messages and filter the ones you interest in. The configuration file is `/etc/rsyslog.d/50-default.conf`.

```
logger -s "Hello Logs"
# On macOS
log show --last 1m | grep Hello
# On Linux
journalctl --since "1m ago" | grep Hello
```

In addition, most UNIX systems you can also use the `dmesg` command to access the kernel log (bootup messages). The log is also written to `/var/log/kern.log`.

Authentication log is stored at `/var/log/auth.log`.

The logs are clean by `logrotate`. It is usually run out of cron once a day and the configuration files can be found in `/etc/logrotate.d`.

## Resouces

uptime
{{ site.bin_option_style }}

ltrace
{{ site.bin_option_style }}

Track library calls

strace
{{ site.bin_option_style }}

Track system calls

lsof
{{ site.bin_option_style }}

```bash
# List processes which opened a specific file
lsof /var/log/syslog 
# List opened files under a directory
lsof +D /var/log/
# List opened files based on process names starting with
lsof -c ssh
# List file opened by a specific process
lsof -p 1753
# List files (not) opened by a specific user
lsof -u lakshmanan
lsof -u ^lakshmanan 

# Kill all process that belongs to a particular user
kill -9 `lsof -t -u lakshmanan`
```

ss
{{ site.bin_option_style }}

```bash
# List processes which opened a listening TCP socket 
ss -ltp
# Show the port number rather than the service name
ss -n
```

pidstat
{{ site.bin_option_style }}
ps
{{ site.bin_option_style }}

- VSZ: Virtual memory usage
- RSS: Resident set size, the non-swapped physical memory
- STAT
  - R: running or runnable
  - S: Interruptable sleep
  - D: This is a state that a process can enter when doing certain system calls. In this state, the process is blocked performing a sytem call, and the process cannot be interrupted (or killed) until the system call completes. Most of these uninterruptible system calls are effectively instantaneous meaning that you never observe the uninterruptible nature of the system call. In rare cases (often because of buggy kernel drivers, but possibly for other reasons) the process can get stuck in this uninterruptible state. see [source](https://eklitzke.org/uninterruptible-sleep), [TASK_KILLABLE](https://lwn.net/Articles/288056/)
  - Z: Zombie
  - T: suspended or stopped

```bash
# List all running processes:
   # a: all running processes
   # u: more details / l: long format
   # x: show processes that don't have a TTY
ps aux / alx
# List all running processes including the full command string:
ps auxww
# List all processes of the current user in extra full format:
ps --user $(id -u) -F
# List all processes of the current user as a tree:
ps --user $(id -u) f
# Get the parent pid of a process:
ps -o ppid= -p pid
# List all details
ps -l pid
```

A process is bound to one of the

- regular terminal devices (`tty`)
- pseudoterminal devices (`pts`): emulate terminals with the shell terminal window
- daemon (`?`)

collectl
{{ site.bin_option_style }}

homepage: http://collectl.sourceforge.net/

vmstat | cat /proc/softirqs
{{ site.bin_option_style }}

mpstat -P ALL 1
{{ site.bin_option_style }}

iostat
{{ site.bin_option_style }}

free -m
{{ site.bin_option_style }}

sar
{{ site.bin_option_style }}

Network throughput

```bash
sar -n TCP,ETCP 1
```

## User Permission

group `etc/group`

```bash
nobody:*:-2:
nogroup:*:-1:
wheel:*:0:root
daemon:*:1:root
kmem:*:2:root
sys:*:3:root
tty:*:4:root

# groupname:passwd:ID:users
```

- change group with `newgrp`
- supplementary group IDs: we could also belong to as many as 16 additional groups. we no longer have to change groups explicitly.

password file (get entries with `getpwnam`, `getpwuid`, `getpwent`):

```bash
$ grep $LOGNAME /etc/passwd
ubuntu:x:500:500:ubuntu,,,:/home/ubuntu:/bin/bash

# name:passwd:userID:groupID:comment:workingdir:shell
```

Encrypted password is stored in anthoer file, called **shadow password file**. The shadow password file should not be readable by the world.

1. Real UserID : It is account of owner of this process. In our shell, every process that we'll now run will inherit the privileges of my user account and will run with the same UID and GID. (500 in this example). Only superuser process can change them.
2. Effective UserID : Used for permission checks. When a file is **setuid** (`-rwsr-xr-x` the `s` bit indicates this),  the process changes its Effective User ID (EUID) from the default RUID to the owner of this special binary executable file.
3. Saved UserID : It is used when a process is running with elevated privileges (generally root) needs to do some under-privileged work. In that case, the effective UID (EUID) from before will be saved inside SUID and then changed to an unprivileged task. The saved set-user-ID is copied from the effective user ID by `exec`. 

{{ include img.html filename="Screen Shot 2020-09-29 at 12.20.20 PM.png" }}

Traditional UNIX implementations distinguish two categories of processes: privileged processes (whose effective user ID is 0, referred to as superuser or root), and unprivileged processes (whose effective UID is nonzero). 

The setuid mechanism works well and is quite widespread. However, if the binary were overwritten by a hacked version, for example, malicious code could run with full superuser privileges. To address this problem, starting with kernel 2.2, Linux divides the privileges traditionally associated with superuser into distinct units, known as [_capabilities_](http://man7.org/linux/man-pages/man7/capabilities.7.html), which can be independently enabled and disabled.  Capabilities are a per-thread attribute.

```bash
sudo setcap cap_net_raw+p /bin/ping
# Each thread, or process, has three sets of capabilities associated with it: Permitted, Inheritable and Effective. 
# +p: add CAP_NET_RAW to the Permitted set
```

scirpt:

```bash
useradd -m user -s /bin/bash
yes "123456" | passwd user
adduser user sudo
usermod -aG sudo newuser
groups # shows the groups you belongs to 
```

## Package Manager

### RPM

Although it was created for use in Red Hat Linux, RPM is now used in many Linux distributions. It has also been ported to some other operating systems, such as Novell NetWare (as of version 6.5 SP3), IBM's AIX (as of version 4), **CentOS**, **Fedora** (from the Fedora Project, also sponsored by Red Hat), and **Oracle Linux**. All versions or variants of these Linux operating systems use the RPM Package Manager. 

naming convention: `name-version-release.arch.rpm`

- `release` is the number of times this version of the software has been packaged.

### ipkg / opkg

Naming convention: `name_version_arch.ipk`

Itsy Package Management System. It has been discontinued. Many projects which formerly used ipkg have adopted the ipkg fork opkg as the replacement. It is a lightweight package management system designed for **embedded devices that resembles Debian's dpkg**.  It was used in the Unslung operating system for the Linksys NSLU2 (Optware), in **OpenWrt**, Openmoko, webOS, Gumstix, the iPAQ, QNAP NAS appliances and elsewhere.

Opkg is a full package manager for the root file system, including kernel modules and drivers, while ipkg is just a way to add software to a separate directory (e.g. `/opt`).

[Package Manipulation](https://openwrt.org/docs/guide-user/additional-software/opkg)