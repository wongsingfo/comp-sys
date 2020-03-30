---
layout: default
title: SQL
nav_order: 1
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

- [SQL bolt](https://sqlbolt.com), recommended
- [SQL tutorial - PostgreSQL](https://www.postgresql.org/docs/current/tutorial-sql.html)
- [SQLite SELECT documentation](https://sqlite.org/lang_select.html)
- Database Systems: The Complete Book, Hector Garcia-Molina, Jeffrey Ullman, and Jennifer Widom. Second edition.

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
  - super key: a set of attributes whose values uniquely identify an entity in the set.
  - **Key:** Minimal super-key; a.k.a. “candidate key”
  - There could be more than one candidate key; if so, we designate one of them as the **primary key**
- Foreign Key Constraints
  - Foreign key: Field that refers to tuples in another relation. This is a consistency check which ensures that each value in this column corresponds to another value in a column in another table.
  - Typically, this field refers to the primary key of other relation

----

Benefits of relational model:

- Physical data independence: Can change how data is organized on disk without affecting applications
- Logical data independence: Can change the logical schema without affecting applications (not 100%... consider updates)

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

SQL: declarative -> Parser Rewrite -> Logical Plan (RA tree) -> physical Plan -> Executor

```sql
SELECT [DISTINCT] column, another_table_column, …
FROM mytable
INNER/LEFT/RIGHT/FULL JOIN another_table 
    ON mytable.id = another_table.id
WHERE condition(s)
GROUP BY column
HAVING constraint_expression
ORDER BY column, … ASC/DESC
LIMIT num_limit OFFSET num_offset;
```

```sql
SELECT col_expression AS expr_description
FROM a_long_widgets_table_name AS mywidgets
INNER JOIN widget_sales
  ON mywidgets.id = widget_sales.widget_id;
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
// If you aren't using the `GROUP BY` clause, a simple `WHERE` clause will suffice.
```

Update the database:

```sql
INSERT INTO movies 
  VALUES (4, "Toy Story 4", "El Directore", 2015, 90);

UPDATE movies 
  SET director = "John Lasseter", director = "Lee Unkrich"
  WHERE id = 2;
  
DELETE FROM movies
  where year < 2005;
  
ALTER TABLE Movies
  ADD COLUMN Aspect_ratio FLOAT DEFAULT 2.39;
ALTER TABLE mytable
  DROP column_to_be_deleted;
ALTER TABLE mytable
  RENAME TO new_table_name;

DROP TABLE IF EXISTS mytable;
```

## Transactions

A set of instructions that must be executed all or nothing. Some properties:

- ACID 
  - Atomicity
  - Consistency: bring the database from one valid state to another
  - Isolation: ensures that concurrent execution of transactions leaves the database in the same state that would have been obtained if the transactions were executed sequentially
  - Durability: A committed transaction will remain committed even in the case of a system failure
- Serialization
- recovery

