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
- [Documentation](https://nginx.org/en/docs/)
- [Directive Documentation](http://nginx.org/en/docs/dirindex.html)
- [nginx module tutorial](https://www.evanmiller.org/nginx-modules-guide.html)
- [lua nginx Documentation](https://openresty-reference.readthedocs.io/en/latest/Lua_Nginx_API/)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}


Model: 

- A master process
- several workder processes

NGINX files and directories:

- `/etc/nginx/nginx.conf`: default configuration entry point
- `/etc/nginx/conf.d/`: Files in this directory ending in `.conf` are included in the top-level `http` block from within the `/etc/nginx/nginx.conf` file.
- `/var/log/nginx/`
- use `nginx -s` to send signal. Note that this command should be executed under the same user that started nginx. 


Context:

- `http`, `stream`

## Configuration

configuration file:

- simple directive: `name: parameters;`
- block directive (a.k.a _context_ like [events](https://nginx.org/en/docs/ngx_core_module.html#events), [http](https://nginx.org/en/docs/http/ngx_http_core_module.html#http), [server](https://nginx.org/en/docs/http/ngx_http_core_module.html#server), and [location](https://nginx.org/en/docs/http/ngx_http_core_module.html#location)): `{ a set of instructions }`. The children contexts can override these values at will. The contexts comprises a tree structure:
  - `main/global`
    - `event`
    - `http`
      - `upstream`
      - `server`
        - `location`: longest prefix matching

```nginx
server {
    listen 8080
    location / {
        root /data/www;
    }
    location /images/ {
        root /data;
    }
    error_page  500 502 503 504 /50x.html;
}
```

decides which server should process the request:

1. IP address and port number (`listen 192.168.1.2:80`)
2. request’s header field “Host” (`server_name example.net www.example.net`)

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

```nginx
upstream backend {
    server 10.10.12.45:80      weight=1; 
    server app.example.com:80  weight=2;
    server 10.10.12.32:80      backup;
}
server {
    location / {
        proxy_pass http://backend;
    }
    # A regular expression should be preceded with ~
    # regular expressions has higher priority than the longest prefix matching
    location ~ \.(gif|jpg|png)$ { 
        root /data/images;
    }
}
```

## Module

- Nginx modules are not dynamically linked! They’re compiled right into the Nginx binary.
- Nginx’s module invocation is *extremely* customizable. A hook can be added to many places or events.

Nginx modules have three roles:

- handlers
  - at server startup, attach itself to particular locations defined in the configuration (usually only one handler attaches to a particular location)
  - (if applicable) it also acts as a load-balancer to pick a backend server
  - return:
    - good
    - error
    - decline to process the request and defer to the default handler
- filter: If the handler does not produce an error, the filters are called. 
  - Multiple filters can hook into each location. The order of their execution is determined at compile-time. 
  - works like pipes in Unix
- 

## lua-nginx / OpenResty

[lua-nginx](https://github.com/openresty/lua-nginx-module) is a core component of [OpenResty](https://openresty.org/).

- lua-coroutines (ease of concurrent) + Nginx event model
- a LuaJIT VM instance shared across all the requests in a single Nginx worker process
- plugged into Nginx's "http" subsystem so it can only speaks downstream communication protocols in the HTTP family
- data is shared with in a Nginx worker process until a HUP signal is sent to the Nginx master process to force a reload.

> It is discouraged to build this module with Nginx yourself since it is tricky to set up exactly right.

## Use Case

### Logging

- [Docs](https://docs.nginx.com/nginx/admin-guide/monitoring/logging/)

```nginx
# keyval_zone zone=name:size [state=file] [timeout=time] [type=string|ip|prefix] [sync];
# state: makes it persistent across nginx restarts. (in JSON format)
# type: activates an extra index optimized for matching the key
keyval_zone zone=clients:80m timeout=3600s;

# keyval key $variable zone=name;
# Creates a new $variable whose value is looked up by the key in the key-value database.
keyval $remote_addr:$http_user_agent $seen zone=clients;

server {
    listen 443 ssl;

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers   HIGH:!aNULL:!MD5;

    if ($seen = "") {
        set $seen  1;
        set $logme 1;
    }
    access_log  /tmp/sslparams.log sslparams if=$logme;

    # ...
}
```

### HTTP Manipulation

The “`@`” prefix defines a named location. Such a location is not used for a regular request processing, but instead used for request redirection. 

```nginx
location / {
    # Checks the existence of files in the specified 
    # order and uses the first found file for request processing
    try_files /system/maintenance.html
              $uri $uri/index.html $uri.html
              @mongrel;
}

location @mongrel {
    proxy_pass http://mongrel;
}
```

ngx_http_rewrite_module:

- `last` starts a search for a new location matching the changed URI
- `break`
- `redirect`: 302
- `permanent`: 301

### FastCGI

```nginx
server {
    root /data/www;
  
    location / {
        index   index.html index.php;
    }
  
    location ~ \.php$ {
        fastcgi_pass  localhost:9000;
        # $document_root=/data/www;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param QUERY_STRING    $query_string;
    }

    location ~ \.(gif|jpg|png)$ {
        root /data/images;
        expires 30d;
    }
}
```

