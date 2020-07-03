---
layout: default
title: Kafka
nav_order: 150
parent: Network System
---

# Kafka
{: .no_toc }

a distributed streaming platform, which can used for:

- a Messaging System
- a Storage System
- Stream Processing

References:
{:toc}

- [Introduction](https://kafka.apache.org/intro)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## KafKa

Concept:

- Topic = Record + Record + Record
- Producer publishes a stream of records to one or more Kafka topics
- Consumer subscribes to one or more topics and process the stream of records produced to them.
- Stream Processor acts as a `map` function, effectively transforming the input streams to output streams.
- Connector is an action replayer for Producers and Consumers.

The structure of the Topic:

- For each topic, the Kafka cluster (one or more servers that can span multiple datacenters) maintains a partitioned log
- Each partition is an **ordered** (by the time a record is produced), immutable sequence of records. (Kafka only provides a total order over records within a partition, not between different partitions in a topic.)
- Each partition has one server which acts as the "leader" and zero or more servers which act as "followers". The followers passively replicate the leader.
- Each instance is the exclusive consumer of a "fair share" of partitions at any point in time.

## Distributed Data

- scalability
  - Vertical 
    - Shared-memory architecture 
    - Shared-disk architecture: machines are connected by fast network. often used for data warehousing workloads
  - Horizontal
    - Shared-nothing architecture 
- high availability 
- low latency

## Replication

Leader-based relication (active/passive or master-slave replication)

- role
  - Leader / master / primary
  - Follower / replicas / slave / secondary / hot standby
- writes only accepted on the leader, but reads accepted by any followers.
- synchrounous update:
  - Too slow
  - semi-synchorous: in practice, there is one node to be synchronous; that gurantees that we have an up-to-date copy of the data at least two nodes.
  - chain replication in Microsoft Azure Storage
- outage
  - follower: just catch up with the leader
  - Leader ("failover" problem): choose a new leader
    - the new leader may not be up-to-date
    - two nodes believe they are leaders ("split brain" problem)

Implementation:

- Statement-based replication: the leader logs every statement it executes and sends the statement to its followers.
  - cannot handle non-pure operation
    - nondeterminstatic function, such as `NOW()` to get the current time
    - autoincrementing function
- Write-ahead log (WAL) shipping: log describe the data on veery low level. It contains details of which bytes were changed in which disk blocks.
  - It supports zero-downtime upgrade (1. update a follower 2. make a failover)
- Logical (row-based) log replication.
- Trigger-based relication: The trigger has the opportunity to log a change into a table, to which a external process can apply any necessary application logic.
  - flexable but high overhead

Eventual consistency: we may wait some time (often a few seconds) to see up-to-date information from an asychronous follower.

- Read-your-write / read-after-write consistency:  a user always see his updates (but no promises about others)
  - solution:
    - only read from leaders for one minute after the last update
    - let the client remember the timestamp of the most recent update
  - it is more difficult in the cross-device scenario 
- Monotonic reads: a user may see things moving backward in time
  - Solution: each user makes reads from the same replica
- Consistent prefix reads: guarantee a sequence of writes happens in a centain order.
  - solution:
    - any related writes are written to the same partition (rather than the same replica)
    - causal dependency

Multi-leader replication: each leader is a follower of another leader.

- Use case:
  - multi-datacenter operation. a leader per datacenter
  - clients with offline operation / colllaboartive editing
- Resolve write conflicts (the concurrent values are call **siblings**)
  - Avoidance: the reqeuests from the same user are routed to the same datacenter.
  - Convergence: 
    - last write win (LWW): the write with highest UUID wins
    - the replica with highest UUID wins 
    - Merge the values. Prompt the user at some later time
  - CRDT data structure used for mergeing siblings
- Replication topology: all-to-all, circular, star

Leaderless replication (Dynamo-style): in pratice, it is for app that tolerate eventual consistency

- writes and reads are send to several replicas to achieve **Quorum consistency**
  - n replicas; write is confirmed by w nodes; read is confirmed by r nodes;
  - w + r > n (gurantee that read and write operations overlap in at least one node), we expect to get an up-to-date value when reading
- slopyy quorums:
  - Write to nodes outside the designated n nodes 
  - Write back to the designated when network interruption is fixed. (**hinted handoff**)
- how does a replica follow up?
  - read repair: when a client reads from nodes, it can detect any stale responses.
  - Anti-entropy process: a background process that looks for differences between replcas.

## Partitioning

