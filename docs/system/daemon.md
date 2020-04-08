---
layout: default
title: Daemon
parent: Computer System
nav_order: 100
---

# Daemon
{: .no_toc }

reference: 


## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Session

When the user tries to exit from the session:

1. the OS sends SIGHUP to the session (the default behavior of a process receiving SIGHUP is to exit)
2. the session send SIGHUP to all foreground processes (this is the default behavior; `shopt | grep huponexit` defaults to `off`)
3. the session exits

nohup [command] &
{{ site.bin_option_style }}

- stop receiving SIGHUP
- close the STDIN
- redirect STDOUT and STDERR to the file `nohup.out`

## crond

- global configuration: `/etc/crontab`
- `crontab` command

```bash
service crond start
service crond restart
service crond status 
service crond stop
service crond reload
```
