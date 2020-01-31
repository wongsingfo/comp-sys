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

OOE is also known as _dynamic scheduling_.

In this paradigm, a processor executes instructions in an order governed by the availability of input data and execution units, rather than by their original order in a program. Here is an example:

```
ld	r1, 0(r2)	// load r1 from memory at r2
add	r2, r1, r3	// r2 := r1 + r3
add	r4, r3, r5	// r4 := r3 + r5
```

Suppose, the `ld` takes a long time to load. To avoid hazard, the pipleine is stalled. However, the third instruction can be decoded and issued now. 

With out-of-order execution (OoO for short), the processor would issue each of the instructions in program order, and then enter a new pipeline stage called "read operands" during which instructions whose operands are available would move to the execution stage, regardless of their order in the program. If we can reorder instructions, **we don't have to worry about WAR and WAW hazards.**




