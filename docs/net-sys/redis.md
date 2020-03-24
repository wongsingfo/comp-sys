---
layout: default
title: Redis
nav_order: 150
parent: Network System
---

# Redis
{: .no_toc }

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