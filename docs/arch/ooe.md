---
layout: default
title: Out-of-Order Execution
parent: Processor Architecture
nav_order: 50
---

# Out-of-Order Execution (OOE / OoOE / OoO)
{: .no_toc}

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

Reference:

- [cse.tamu-cs5513](http://hpca23.cse.tamu.edu/taco/utsa-www/cs5513-fall07/lecture5.html)
- Section 3.4, Computer Architecture: A Quantitative Approach, fifth edition

OOE is also known as _dynamic scheduling_.

## Basic Idea

In this paradigm, a processor executes instructions in an order governed by the availability of input data and execution units, rather than by their original order in a program. Here is an example:

```
ld	r1, 0(r2)	// load r1 from memory at r2
add	r2, r1, r3	// r2 := r1 + r3
add	r4, r3, r5	// r4 := r3 + r5
```

Suppose, the `ld` takes a long time to load. To avoid hazard, the pipleine is stalled. However, the third instruction can be decoded and issued now. 

With out-of-order execution (OoO for short), the processor would issue each of the instructions in program order, and then enter a new pipeline stage called "read operands" during which instructions whose operands are available would move to the execution stage, regardless of their order in the program. If we can reorder instructions, **we don't have to worry about WAR and WAW hazards.**


## Details

To allow out-of-order execution, we essentially split the ID pipe stage of our simple five-stage pipeline into two stages:

1. Issue—Decode instructions, check for structural hazards.
2. Read operands—Wait until no data hazards, then read operands.

Here, we focus on a sophisticated technique, called _Tomasulo’s algorithm_. It handles antidependences and output dependences by effectively renaming the registers dynamically. 

In Tomasulo’s scheme, register renaming is provided by _reservation stations_, which buffer the operands of instructions waiting to issue. The information held in the reservation stations at each functional unit determines **when an instruction can begin execution at that unit** (signaled by CDB). 

{% include img.html filename="Screen Shot 2020-02-01 at 11.39.16 AM.png" %}

To determine if a load can be executed at a given time, the processor can check whether any uncompleted store that precedes the load in program order shares the same data memory address as the load. Similarly, a store must wait until there are no unexecuted loads or stores that are earlier in program order and share the same data memory address. This can be eliminate by the renaming of a register together with the buffering of a result until no outstanding references to the earlier version of the register remain, or the speculation techniques.

Here is an example:

{% include img.html filename="Screen Shot 2020-02-01 at 11.39.35 AM.png" %}



