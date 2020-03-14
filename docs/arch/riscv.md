---
layout: default
title: RISC-V
parent: Processor Architecture
nav_order: 50
---

# RISC-V
{: .no_toc}

RISC-V is an ISA specification but not a processor.

## Table of contents
{: .no_toc .text-delta }

The RISC-V ISA is defined as a base integer ISA, which must be present in any implementation, plus optional extensions to the base ISA. The base is carefully restricted to a minimal set of instructions sufficient to provide a reasonable target for compilers, assemblers, linkers, and operating systems.

Each base integer instruction set is characterized by 

- the width of the integer registers
- the corresponding size of the user address space.

There are two primary base integer variants, RV32I and RV64I. The suffix "I" means the base integer ISA. Diffenrent standard extensions add different suffixes.

The base RISC-V ISA has a **little-endian memory system**, but non-standard variants can provide a big-endian or bi-endian memory system.

1. TOC
{:toc}

Reference:

- The RISC-V Instruction Set Manual Volume I: User-Level ISA

## Instruction-Length Encoding

{% include img.html filename="Screen Shot 2020-02-01 at 11.47.31 PM.png" %}

## Register

At user-level, there are 32 general registers (named `x0/zeor`, `x1`, ..., `x31`) plus a `ip` register.

{% include img.html filename="Screen Shot 2020-03-02 at 9.19.44 PM.png" width="588" %}

The gp (Global Pointer) register is a solution to further optimise memory accesses within a single 4KB region. The gp register should be loaded during startup with the address of the `__global_pointer$` symbol and should not be changed later. This process is also called _relaxing_, and can be disabled by `-Wl,--no-relax`.

## Instruction Formats

{% include img.html filename="Screen Shot 2020-03-02 at 9.20.21 PM.png" %}
