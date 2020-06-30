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
- writes only accepted on the leader
- synchrounous update:
  - Too slow
  - semi-synchorous: in practice, there is one node to be synchronous; that gurantees that we have an up-to-date copy of the data at least two nodes.
  - chain replication in Microsoft Azure Storage
- outage
  - follower: just catch up with the leader
  - Leader ("failover" problem): choose a new leader
    - the new leader may not be up-to-date
    - two nodes believe they are leaders ("split brain" problem)

Eventual consistency

- Read-your-write 
- Monotonic reads