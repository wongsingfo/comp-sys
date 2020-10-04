---
layout: default
title: Signal
parent: Computer System
nav_order: 20
---

# Signal
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

|  Signal   | Portable number | Default action | Description                                                  |
| :-------: | :-------------: | :------------: | :----------------------------------------------------------- |
|  SIGABRT  |        6        |   Core dump    | Process abort signal                                         |
|  SIGALRM  |       14        |   Terminate    | Alarm clock                                                  |
|  SIGBUS   |       N/A       |   Core dump    | Access to an undefined portion of a memory object            |
|  SIGCHLD  |       N/A       |     Ignore     | Child process terminated, stopped, or continued              |
|  SIGCONT  |       N/A       |    Continue    | Continue executing, if stopped                               |
|  SIGFPE   |        8        |   Core dump    | Erroneous arithmetic operation                               |
|  SIGHUP   |        1        |   Terminate    | Hangup                                                       |
|  SIGILL   |        4        |   Core dump    | Illegal instruction                                          |
|  SIGINT   |        2        |   Terminate    | Terminal interrupt signal                                    |
|  SIGKILL  |        9        |   Terminate    | Kill **(cannot be caught or ignored)**                       |
|  SIGPIPE  |       13        |   Terminate    | Write on a pipe with no one to read it                       |
|  SIGPOLL  |       N/A       |   Terminate    | Pollable event                                               |
|  SIGPROF  |       N/A       |   Terminate    | Profiling timer expired                                      |
|  SIGQUIT  |        3        |   Core dump    | Terminal quit signal                                         |
|  SIGSEGV  |       11        |   Core dump    | Invalid memory reference                                     |
|  SIGSTOP  |       N/A       |      Stop      | Stop executing **(cannot be caught or ignored)**             |
|  SIGSYS   |       N/A       |   Core dump    | Bad system call                                              |
|  SIGTERM  |       15        |   Terminate    | Termination signal                                           |
|  SIGTRAP  |        5        |   Core dump    | Trace/breakpoint trap                                        |
|  SIGTSTP  |       N/A       |      Stop      | Terminal stop signal                                         |
|  SIGTTIN  |       N/A       |      Stop      | Background process attempting read                           |
|  SIGTTOU  |       N/A       |      Stop      | Background process attempting write                          |
|  SIGUSR1  |       N/A       |   Terminate    | User-defined signal 1                                        |
|  SIGUSR2  |       N/A       |   Terminate    | User-defined signal 2                                        |
|  SIGURG   |       N/A       |     Ignore     | [Out-of-band data](https://en.wikipedia.org/wiki/Out-of-band_data) is available at a socket |
| SIGVTALRM |       N/A       |   Terminate    | Virtual timer expired                                        |
|  SIGXCPU  |       N/A       |   Core dump    | CPU time limit exceeded                                      |
|  SIGXFSZ  |       N/A       |   Core dump    | File size limit exceeded                                     |
| SIGWINCH  |       N/A       |     Ignore     | Terminal window size changed                                 |

