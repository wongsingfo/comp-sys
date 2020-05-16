---
layout: default
title: Proxy
parent: Network Stack
nav_order: 20
---

# Proxy

References:

- `proxychains4`
- [Project V](https://www.v2ray.com)
- [toutyrater](https://toutyrater.github.io)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}


- VPS (virtual private server): a virtual machine sold as a service by an Internet hosting service. The virtual dedicated server also has a similar meaning
- NAS (Network-attached storage): a file-level computer data storage server connected to a computer network providing data access to a heterogeneous group of clients. 

## V2Ray

The time delay should be within 90 seconds. Every V2Ray node is a "switch", which has inbounds and outbounds. V2Ray allows different protocol (listed below) at a bound.

- blackhole (don't relay the data)
- freedom
- Shadowsocks
- VMess


```
systemctl start v2ray
```

## ssh

Set `GatewayPorts=yes` in `/etc/ssh/sshd_config` at the relay. Use `sudo service sshd restart` to restart the ssh server.

Enable reverse proxy:

```
ssh -R 2222:localhost:22 relay@123.123.123.123
autossh -M 55555 -NfR 2222:localhost:22 relay@123.123.123.123
```

Port Forwarding ([credit](https://unix.stackexchange.com/questions/115897/whats-ssh-port-forwarding-and-whats-the-difference-between-ssh-local-and-remot)): For example, if we execute jupyter notebook in the remote server that listens to the port 8888. Thus, to forward that to the local port 9999, we would do `ssh -L 9999:localhost:8888 foobar@remote_server` and then navigate to `locahost:9999` in our local machine. 

Local Port Forwarding:

{% include img.html filename="a28N8.png" width=500 %}

Remote Port Forwarding:

{% include img.html filename="4iK3b.png" width=500 %}

## proxychains4

```
brew install proxychains-ng`
```


