---
layout: default
title: Nginx
nav_order: 180
parent: Network System
---

# Nginx
{: .no_toc }

- event-driven (asynchronous) architecture
- high-performance and small memory footprint

References:
{:toc}

- [The C10K Problem](http://www.kegel.com/c10k.html)
- NGINX Cookbook - Advanced Recipes for High Performance Load Balancing
- [Directive Documentation](http://nginx.org/en/docs/dirindex.html)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}


Model: 

- A master process
- several workder processes

NGINX files and directories:

- `/etc/nginx/nginx.conf`: default configuration entry point
- `/etc/nginx/conf.d/`: Files in this directory ending in `.conf` are included in the top-level `http` block from within the `/etc/ nginx/nginx.conf` file.
- `/var/log/nginx/`


Context:

- `http`, `stream`

## Load Balancing

Challenge:

- Horizontal scaling: As the load increases, another copy of the system can be brought online.
- Working with stateful applications at scale requires an intelligent load balancer.
- Check the health of the upstream servers.

Model:

- `upstream` upstream_name {`server` 1; `server` 2}
- `server` `proxy_pass` upstream_name


Load Balancing Strategies:

- Round robin (default)
- Least connections (`least_conn`)
- Least time (`least_time`): akin to least connections in that it proxies to the upstream server with the least number of current connections but favors the servers with the lowest average response times.
- Generic hash (`hash`): This method is very useful when you need more control over where requests are sent or for determining which upstream server most likely will have the data cached. 
- Random
- IP hash: uses the client IP address as the hash. This method ensures that clients are proxied to the same upstream server as long as that server is available, which is extremely helpful when the session state is of concern and not handled by shared memory of the application.





