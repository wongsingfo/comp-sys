---
layout: default
title: Database
nav_order: 0
parent: Network System
---

# Database Management System (DBMS) 
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

Resources: 

- [MIT 6.830](http://db.csail.mit.edu/6.830/); [another version](https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-830-database-systems-fall-2010/assignments/)
- [SimpleDB](https://github.com/MIT-DB-Class/simple-db-hw), recommended
- Database Management Systems, by Johannes Gehrke and Raghu Ramakrishnan, recommended
- [UW CSE444](https://courses.cs.washington.edu/courses/cse444/19sp/), recommended

Database Management System (DBMS) Implementations: SQLite, PostgreSQL, MySQL, SQLite, Oracle, Microsoft, etc.


## Storage Management


Record ID (RID) typically is (PageID, SlotNumber). See future discussion on indexes and transactions.

LOB (large objects):

- binary large object (BLOB)
- character large object (CLOB)

Key questions:

- How do we organize pages into a file (so that we can find free space efficiently) ?
  - Sequence of pages (impl in simpleDB)
  - Listed list of pages
  - Directory of pages. Directory contains **free-space count** for each page. Faster inserts for variable-length records
- How do we organize data within a page?

Buffer Manager: Brings pages in from memory and caches them

Column store v.s. Row store

- Row-store storage managers are most commonly used today for OLTP systems. They offer high-performance for transactions.
- Column-stores win for analytical workloads and are widely used in OLAP.

## Index

RID: unique tuple identifier (e.g. `(PageID, SlotID)` )

search key: can be any set of fields (not the same as the primary key!)

data entry for key k can be:

- (k, RID)
- (k, list-of-RIDs)
- the actual record with key k (also called _indexed file organization_)

index: collection of data entries (now we have two files: data file and index file)

- dense or sparse
- primary or secondary 
  - primary: determines the location of indexed records
- clustered or unclustered
  - clustered: records close in index are close in data

Large indexes: index the index itself

- hash-based: not good for range queries
- tree-based: 
  - B tree: 1 node = 1 page
  - B+ tree: 
    - keep tree balanced in height
    - make leaves into a linked list to facilitate range queries

B+ tree (default index structure on most DBMSs):

- parameter d
- each node (except root) has d ≤ m ≤ 2d keys and m+1 pointers
- each leaf has d ≤ m ≤ 2d keys and pointers to
  - the data records
  - the next leaf (for range queries)
- usually:  2d x key-size + (2d+1) x pointer-size ≤ block-size

## Execution

SQL query is first transformed into _physical plan_. Execution of physical plan is pull-based. 

Each operator pre-allocates heap space for I/O tuples and its internal state. **DBMS limits how  much memory each operator, or each query can use.**

join operator(R S):

- Hash join: one-pass when the memory can hold the relation
- nested loop join; and (reduce the number of swap-in/out of pages) B(R) + T(R)B(S)
  - page-at-a-time refinement B(R) + B(R)B(S)
  - block-nested-loop refinement: B(R) + B(R)B(S)/(M-1)   (M is the memory size)
- sort-merge join
- index-based nested loop join
  - If index on S is clustered: B(R) + T(R)B(S)/V(S,a)
    B: sizeof R, T: #tuples V: distinct values
  - If index on S is unclustered: B(R) + T(R)T(S)/V(S,a)
    - Don’t build unclustered indexes when V(R,a) is small! (T >> B)

What if the data does not fit in memory: two-pass algorithm

- sorting
  - a **run**: an increasing subsequence
  - merge and sort run \~3B(R)
- join (R S):
  - runs of R; runs of S
  - join while merging
- grace-join (hashing)
  - use hash to split R/S into k buckets (k <= M)
    - expected bucket size = B(R) / k <= M
    - When a bucket fills up, flush it to disk
    - using another hash function to join each pair of buckets
  - join every pair of buckets
- Hybrid join
  - still into k buckets, but the first t buckets stay in the memory, while k-t buckets to disk (k <= M)
  - we first join t buckets immediately and then join the k-t pairs of buckets
  - t / k * B(s) <= M
  - adjust t dynamically
    - start with t = k
    - when run out of memory, send one bucket to disk, t -= 1
  - time: 3B(R) + 3B(S)

