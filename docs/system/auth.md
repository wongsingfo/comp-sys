---
layout: default
title: Authentication
parent: Computer System
nav_order: 0
---

# Authentication in Linux
{: .no_toc }

reference: 

- Secure Programming Cookbook for C and C++: Recipes for Cryptography, Authentication, Input Validation & More - John Viega and Matt Messier

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}


## System Log

```
logger "Hello Logs"
# On macOS
log show --last 1m | grep Hello
# On Linux
journalctl --since "1m ago" | grep Hello
```

In addition, most UNIX systems you can also use the `dmesg` command to access the kernel log.

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

```bash
# List all running processes:
ps aux
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






