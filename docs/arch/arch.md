---
layout: default
title: Processor Architecture
nav_order: 32
permalink: docs/arch
has_children: true
---

# Processor Architecture

## References

- Computer Orgnization and Design, fifth edition
- Computer Architecture: A Quantitative Approach, fifth edition
- [uclibc ABI docs](https://uclibc.org/docs/)

## Terms

- dynamic: made by processors.
- static: decisions are made by the compiler before execution.
- IPC (instructions per cycles) and CPI
- VLIW: very long instruction word

## Instruction-Level Parallelism (ILP)

### Pipeline

- Instruction Fetech  
- Instruction Decode
- Execution
- Memory Access
- Write Back

Pipeline introduces _hazards_:

- RAW (Read after Write):
```
i1. *R2* <-  R5 + R3
i2.  R4  <- *R2* + R3
```
- WAW
```
i1. *R2* <- R4 + R7
i2. *R2* <- R1 + R3
```
- WAR
```
i1.  R4  <- R1 + *R5*
i2. *R5* <- R1 +  R2
```

If a hazard causes stall cycles, then all instructions up to the offending instruction are stalled until the hazard is gone.  Forwarding, branch prediction, and other techniques can reduce the number of stall cycles we need.

### Out-of-Order Execution （OOE/OoOE/OoO)

[See the sub-page.](ooe)

### Speculation

Speculation is an approach that allows the compiler or the processor to “guess” about the properties of an instruction (e.g., a load does not refer to the same address), so as to enable execution to begin for other instructions that may depend on the speculated instruction.

- static: The compiler can use speculation to reorder instructions, moving an instruction across a branch or a load across a store. In addition, the compiler inserts additional instructions that check the accuracy of the speculation and provide a fix-up routine to use when the speculation is incorrect
- dynamic: The processor usually buffers the speculative results until it knows they are no longer speculative. If the speculation is incorrect, the hardware flushes the buffers and re-executes the correct instruction sequence.

## Branch

### Dynamic Branch Prediction

One implementation of that approach is a branch prediction buffer or branch history table. A branch prediction buffer is a small memory indexed by the lower portion of the address of the branch instruction. The memory contains a bit that says whether the branch was recently taken or not.

Often, 2-bit prediction schemes are used:

{% include img.html filename="Screen Shot 2020-01-31 at 12.56.40 PM.png" width="588" %}

### Static: Branch Delay Slot

Compilers and assemblers try to place an instruction that **always** executes after the branch in the _branch delay slot_.

As processors go to both longer pipelines and issuing multiple instructions per clock cycle, the branch delay becomes longer, and a single delay slot is insufficient. Hence, delayed branching has lost popularity compared to more expensive but more flexible dynamic approaches.

## Multiple Issue

