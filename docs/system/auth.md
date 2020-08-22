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

ps
{{ site.bin_option_style }}

- VSZ: Virtual memory usage
- RSS: Resident set size, the non-swapped physical memory
- STAT
  - R: running or runnable
  - S: Interruptable sleep
  - D: Uninterruptible sleep, processes that cannot be killed or interrupted with a signal, usually to make them go away you have to reboot or fix the issue
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

## User

password file:

```bash
$ grep $LOGNAME /etc/passwd
ubuntu:x:500:500:ubuntu,,,:/home/ubuntu:/bin/bash

# uid and gid are both 500
```

1. Real UserID : It is account of owner of this process. In our shell, every process that we'll now run will inherit the privileges of my user account and will run with the same UID and GID. (500 in this example)

2. Effective UserID : When a file is **setuid** (`-rwsr-xr-x` the `s` bit indicates this),  the process changes its Effective User ID (EUID) from the default RUID to the owner of this special binary executable file 

3. Saved UserID : It is used when a process is running with elevated privileges (generally root) needs to do some under-privileged work. In that case, the effective UID (EUID) from before will be saved inside SUID and then changed to an unprivileged task. 

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