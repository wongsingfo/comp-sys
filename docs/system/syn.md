---
layout: default
title: Synchronization
parent: Computer System
nav_order: 20
---

# Synchronization
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Read-Copy Update (RCU)

see `/Documentation/RCU/whatisRCU.txt`

protect data structures that are mostly accessed for reading by several CPUs. It allows

- multiple readers
- multiple writers
- lock-free


Reader:

- `rcu_read_lock()`
- read
- `rcu_read_unlock()`

Writer:

- makes a copy of the **whole** data structure
- write
- memory barrier
- update the pointer to the data structure
- `call_rcu(rcu_head p, cb)`, the ruc_head is usually embedded indide the data structure. The `cb` is called when all CPUs have gone through a quiescent state. The `cb` usually frees the old copy of the data structure.

The old copy can be freed only after all readers have executed `rcu_read_unlock()`. Periodically, once every tick, the kernel checks whether the local CPU has gone through a _quiescent state_. If all CPUs have gone through a quiescent state, a local tasklet stored in `rcu_tasklet` executes all `cb`s in the list.


## atomic_t

atomic_read