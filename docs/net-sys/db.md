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