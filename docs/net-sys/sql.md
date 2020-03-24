---
layout: default
title: SQL
nav_order: 180
parent: Network System
---

# SQL
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

SQL: A declarative language in which you specify the data you want in terms of its properties.

Resources: 

- [MIT 6.830](http://db.csail.mit.edu/6.830/); [another version](https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-830-database-systems-fall-2010/assignments/)
- [SimpleDB](https://github.com/MIT-DB-Class/simple-db-hw)
- Database Management Systems, by Johannes Gehrke and Raghu Ramakrishnan
- [UW CSE444](https://courses.cs.washington.edu/courses/cse444/19sp/)
- [SQL tutorial- PostgreSQL](https://www.postgresql.org/docs/current/tutorial-sql.html)
- [SQLite SELECT documentation](https://sqlite.org/lang_select.html)
- [SQL bolt](https://sqlbolt.com)
- Database Systems: The Complete Book, Hector Garcia-Molina, Jeffrey Ullman, and Jennifer Widom. Second edition.

Database Management System (DBMS) Implementations: SQLite, PostgreSQL, MySQL, SQLite, Oracle, Microsoft, etc.

## Relational Model

Database = { relations }

relation (a.k.a. table) is subset of S1 x S2 x Sn, where Si is the domain of attribute i. n is the degree (or arity) of the relation.

- relation = { tuples }
- set semantics: 
  - Ordering immaterial
  - All rows are distinct
- bag semantics: 
  - Query answers may have duplicates

Tuple (a.k.a. row) is an element of S1 x S2 x Sn

- Ordering is significant
- Domain of each column is a primitive type

---

Relation Schema: 

- relation name
- field names + field domains

Database schema = { relation schemas }

Relation Instance = set of tuples (a.k.a records) matching the schema

Database instance = { relation instances }

Integrity constraints

- domain constraint: attribute values must come from the attribute domain
- key constraints: 
  - super key: set of attributes that functionally determines all attributes
  - **Key:** Minimal super-key; a.k.a. “candidate key”
  - One minimal key can be selected as **primary key**
- Foreign Key Constraints
  - Foreign key: Field that refers to tuples in another relation. Typically, this field refers to the primary key of other relation

----

Benefits of relational model:

- Physical data independence: Can change how data is organized on disk without affecting applications
- Logical data independence: Can change the logical schema without affecting applications (not 100%... consider updates)

## Transactions

A set of instructions that must be executed all or nothing. Some properties:

- ACID 
  - Atomicity
  - Consistency: bring the database from one valid state to another
  - Isolation: ensures that concurrent execution of transactions leaves the database in the same state that would have been obtained if the transactions were executed sequentially
  - Durability: A committed transaction will remain committed even in the case of a system failure
- Serialization
- recovery

## Query

Set-at-a-time: Query inputs and outputs are relations

### relational algebra (RA)

Five basic operators:

- selection
- projection
- union
- set difference
- cross-product / join
  - theta-join = cross-product + selection
  - equijoin = theta-join (join condition consists _only_ of equalities) + drops all redundant attributes
  - natural join = equijoin + equality on all fields with the same name
  - outer join: include tuples with no matches (use NULL)
    - left outer join
    - right outer join
    - full outer join

Extended operators:

- duplicate elimination
- aggregate operators (min, sum, count)
- grouping operators
  - Partitions tuples of a relation into “groups” 
  - Aggregates can then be applied to groups
- sort operator

### relational calculus

SQL: declarative -> Parser Rewrite 

```sql
SELECT [DISTINCT] column, another_table_column, …
FROM mytable
INNER/LEFT/RIGHT/FULL JOIN another_table 
    ON mytable.id = another_table.id
WHERE condition(s)
ORDER BY column, … ASC/DESC
LIMIT num_limit OFFSET num_offset;
```

```sql
// Person(pname, address, worksfor) 
// Company(cname, address)
SELECT DISTINCT x.pname, y.address
FROM Person AS x, Company AS y
WHERE x.worksfor = y.cname
```

Subqueries:

```sql
SELECT name
FROM Product
WHERE price > ALL (SELECT price
        FROM Purchase
        WHERE maker=‘Gizmo-Works’)

SELECT ... FROM ... WHERE ... IN (SELECT ... )
```

Aggregation

```sql
SELECT count(*) FROM Product WHERE year > 1995
SELECT avg(price) FROM Product WHERE maker=“Toyota”

SELECT city, count(*) FROM sales
GROUP BY city
HAVING sum(price) > 100
```

