---
layout: default
title: Redis
nav_order: 150
parent: Network System
---

# Redis
{: .no_toc }

REmote Dictionary Server

References:
{:toc}

- [Why Your MySQL Needs Redis - Redis Labs](https://www.youtube.com/watch?v=_4HwUVNl9Nc)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Overview

Challenge MySQL facing:

- minimize the cost of data management while scaling (more tables, more computing resources) 
- need flexible data structure to catch up the market
- keep applications responsive (require sub-millisecond latency)
- disk based databased are inherently limited (how to overcome the physical limits?)

Redis:

- performance: The Most Powerful Database (highest throughput at lowest latency in high volume of writes scenario)
- simplicity: data structures
- extensibility: modules

Use cases:

- Caching
  - Look-aside (frequent reads, infrequent writes)
  - write-through
- Session: frequent reads and writes; data is isolated between sessions
- Metering: Rate-limiting
  - Built-in counter
  - TTL
  - single-threaded architecture assures serializability
- Fast Data Ingest
  - Pub/Sub; Lists; Sorted Sets

## Redis Command

```
keys *       -- show all keys
exists [key]
del [key]
set [key] [value]
set [key] [value] nx  -- fail if the key already exists
set [key] [value] xx  -- fail if the key doesn't exist
mset [key1] [value1] [key2] [value2] ...
incr [key]      --- += 1
incr [key] [delta]
get [key]
mget [key1] [key2] ...
expires [key] [seconds]
ttl [key]
type [key]
object encoding [key]    -- show the data encoding format (opaque to user)
```

Redis doesn't support namespace. In general, we use something like `ns:table:id:attr` as keys.


