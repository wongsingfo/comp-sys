---
layout: default
title: Docker
parent: Computer System
nav_order: 80
---

# Docker
{: .no_toc }

reference: 

- [Docker Tutorial for Beginners - A Full DevOps Course on How to Run Applications in Containers](https://www.youtube.com/watch?v=fqMOX6JJhGo)

## Table of contents
{: .no_toc .text-delta }

1. TOC

{:toc}

Example:

```bash
docker run --entrypoint "bash" -p 80 -p 443 -p 10022:22 -e LANG=C.UTF-8 --name centos3 -dt a5fc4f
docker tag c3527aa35c09 tagname
docker inspect container_name # list all info
docker log container_name
```

## Dockerfile

`docker build Dockerfile -t tagname`

```dockerfile
FROM ubuntu

RUN apt-get update
RUN apt-get install python
RUN pip install flask

COPY . /opt/source-code

# container exits when this entry point exits
ENTRYPOINT ["nginx"]
    # overriden by --entrypoint "nginx" option

CMD ["-c", "/etc/nginx/default.conf"]
    # to override the command
    # docker run ubuntu -c /etc/nginx/default.conf
```

## Compose

`docker-compose up` !

```dockerfile
<container name>:
	build: <a directory whih a Dockerfile in it, from which we can build the container. 
	image: <image name>
	ports:
		- <internal port>:<external port>
	link:
		- <another container name>
```

crossref: https://magic3007.github.io/docs/docs/Cheatsheet/docker/

## Networking

Default:

- Bridge mode: a container connected to by default
  - To create a new subnetwork: `docker network create --driver bridge --subnet 182.18.0.0/16 subnetwork name`
  - see all networking setting: `docker inspect blissful-hopper`
- `--network=none`
- Host: `--network=host`

containers reach each other by:

- IP address: BAD praticse
- Container name!  (docker has a built in DNS server)

## Storage

file system: `var/lib/docker` 

- layered architecture (like `git`)
- CoW

Volume (to persist the data):

```bash
docker volume create data_volume  
# create a folder at /var/lib/docker/volumes/data_volume
docker run -v data_volume:/var/lib/mysql mysql
# /var/lib/mysql is mapped to the host folder
docker run -v /data/mysql:/var/lib/mysql mysql
# volume mount: tmp -> /data/mysql
# binding mount: /var/lib/mysql -> tmp

# -v is obsolete
docker run --mount type=bind,source=/data/mysql,target=/var/lib/mysql mysql
```

Storage drivers: AUFS, ZFS, BTRFS, Device Mapper, Overlay, Overlay2