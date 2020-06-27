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
- Designing Data-Intensive Application

Database Management System (DBMS) Implementations: SQLite, PostgreSQL, MySQL, SQLite, Oracle, Microsoft, etc.

Categories:

- online transaction processing (OLTP): small number of records per query
- online analytics processing (OLAP): aggregate over large number of records
  - Data warehouse: 
    - works without affecting OLTP operations
    - OLTP system -> Extract-Transform-Load (ETL) -> data warehouse for OLAP operations

## Data Model

- Relation model (SQL): enforce a schema
- Document database: one-to-many (NoSQL): self-contained document; relationships between documents are rare.
- Graph model: many-to-many (NoSQL): anything is potentially related to everything

data structures:

- LSM-tree (log-strutured merge-tree)
  - log structure
  - SSTable (sorted string table)
  - an in-memory balanced tree data structure (**memtable**)
- B-tree
  - crash recovery 
    - WAL (write-ahead log): an append-only file to which every B-tree modification must be written before it can be applied to the pages of the tree itself.
    - CoW (copy on write)
  - latch (lightweight lock)

in-memory database:

- faster:
  - not because they dont need to read from the disk
  - It is because they can avoid the overheads of encoding in-memory data structures in a form that can be written to disk
- provide data models that are difficult to implement with disk-based indexes
- Further changes: NVM (non-volatile memory)

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
  - dense: 1 2 3 4
  - sparse: 10 20 30 40
- primary or secondary 
  - primary: determines the location of indexed records
- clustered or unclustered
  - clustered (**covering index**): store the row data within the index
  - unclustered (**index with included column**)

heap file: the value is a referece to the row stored elsewhere

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

Multi-column indexes:

- latitude, longtitude (R-tree)
- R, G, B

## Execution

SQL query is first transformed into _physical plan_. Execution of physical plan is pull-based. 

Each operator pre-allocates heap space for I/O tuples and its internal state. **DBMS limits how much memory each operator, or each query can use.**

join operator(R S):

- Hash join: one-pass when the memory can hold the relation
- nested loop join; and (reduce the number of swap-in/out of pages) B(R) + T(R)B(S)
  - page-at-a-time refinement B(R) + B(R)B(S)
  - block-nested-loop refinement: B(R) + B(R)B(S)/(M-1)   (M is the memory size)
- sort-merge join
- index-based nested loop join
  - If index on S is clustered: B(R) + T(R)B(S)/V(S,a)
    **B: sizeof R, T: #tuples, V: distinct values**
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
  - use hash to split R and S into k buckets (k <= M)
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

## Query Optimization

1. Collect statistical summaries of stored data
2. Estimate size in a bottom-up fashion (most difficult)
   - T(R)
   - V(R, a)
   - B(R)
   - min, max
   - histograms
   - Collection approach: periodic, using sampling
3. Estimate cost by using the estimated size

Selectivity Factor: Each condition `cond` reduces the size by some factor called selectivity factor.

```sql
Q = SELECT * 
    FROM R, S, T
    WHERE R.B=S.B and S.C=T.C and R.A<40
```

T(Q) = T(R) x T(S) x T(T) x Selectivity(R.B = S.B) x Selectivity(S.C=T.C) x Selectivity(R.A<40)

Selectivity Factors for Conditions

- A = c: 1 / V(R, A)
- A < c: (c - Low(R, A)) / (high(R, A) - Low(R, A))
- A = B: 1 / max(V(R, A), V(S, A))
  - T(R⨝S) = T(R) x T(S) / max(V(R, A), V(S, A))

Histograms: make size estimation much more accurate

- eq-width: 0-10: 1000, 10-20: 500, 20-30: 5000
- eq-depth: 0-33: 2000, 33 - 47: 2000, 47 - 100: 2000
- v-optimal (adopted by modern DBMS): Defines bucket boundaries in an optimal way, to minimize the error over all point queries