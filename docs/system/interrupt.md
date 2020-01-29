---
layout: default
title: Interrupt
parent: Computer System
nav_order: 20
---

# Interrupt
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

Interrupts are often divided into synchronous and asynchronous interrupts:

|                     | synchronous      | asynchronous           |
| ------------------- | ---------------- | ---------------------- |
| produced by         | CPU control unit | other hardware devices |
| also referred to as | *exceptions*     | *interrupts*           |

Classification:

- Exception
  - Processor-detected exceptions
    - Faults: when the exception handler terminates, restart the instruction that caused the exception.
    - Traps: on the contrary, there is no need to reexecute the instruction that terminated 
    - Aborts: the handler has no choice but to force the affected process to terminate
  - Programmed exceptions (also known as _software interrupts_): e.g., `int`, `int3`, `into` (check for overflow), `bound`
- Interrupt
  - Maskable interrupts
  - Nonmaskable interrupts (as referred to as NMI)

## Exceptions

| # Exception                      | Signal  |
| -------------------------------- | ------- |
| 0 Divide error Exception handler | SIGFPE  |
| 1 Debug                          | SIGTRAP |
| 2 NMI                            | None    |
| 3 Breakpoint                     | SIGTRAP |
| 4 Overflow                       | SIGSEGV |
| 5 Bounds check                   | SIGSEGV |
| 6 Invalid opcode                 | SIGILL  |
| 7 Device not available           | None    |
| 8 Double fault                   | None    |
| 9 Coprocessor segment overrun    | SIGFPE  |
| 10 Invalid TSS                   | SIGSEGV |
| 11 Segment not present           | SIGBUS  |
| 12 Stack segment fault           | SIGBUS  |
| 13 General protection            | SIGSEGV |
| 14 Page Fault                    | SIGSEGV |
| 15 Intel-reserved                | None    |
| 16 Floating-point error          | SIGFPE  |
| 17 Alignment check               | SIGBUS  |
| 18 Machine check                 | None    |
| 19 SIMD floating point           | SIGFPE  |

### Triple Fault

- an interrupt => not set up to handle
- a general protection exception => can not handle
- a double fault exception => can not handle
- give up, reboot

It's used in some legacy machine to switch from protected mode back to real mode in a very fast way:

```
lidt -1  # sets the interrupt descriptor table to an invalid physical address
int 1    # the IDT couldn't be found, raise an exceptions
```

## Interrupts

### Issue an IRQ

Each hardware device controller capable of issuing interrupt requests usually has a single output line designated as the Interrupt ReQuest (IRQ) line. This line is connected to the Programmable Interrupt Controller (PIC). When a signal is raised, the PIC:

1. Stores the raised signal vector in an I/O port (Intel’s default vector associated with IRQn is n+32)
2. raised signal to the processor INTR pin
3. Waits until the CPU acknowledges the interrupt signal by writing into one of the PIC I/O ports.

### Interrupt in SMP Architecture

We need I/O Advanced Programmable Interrupt Controller (I/O APIC) and a local APIC at each processor. Each local APIC has:

- an internal clock
- a local timer device
- two additional IRQ lines, LINT0 and LINT1 for local APIC interrupt. These registers allow CPUs in multi-APIC system to generate interprocessor interrupts (IPI).
- Interrupt Command Register (ICR): used for IPI

The local APIC and the I/O APIC are connected by Interrupt Controller Communication (ICC) bus. 

By default, distributing interrupts among processors in a round-robin fashion. It uses a technique called _arbitration_. 

`/proc/interrupt` tells us the number of interrupts per IRQ on the x86 architecture. The first column refers to the IRQ number. Each CPU in the system has its own column and its own number of interrupts per IRQ.

Every local APIC has a programmable task priority register (TPR), which is used to compute the priority of the currently running process. You can adjust the which CPUs each of those IRQs will be handled by modifying `/proc/irq/IRQ_NUMBER/smp_affinity` for each IRQ number and the OS will set the TPR accordingly.

## Gates

<img src="{{site.baseurl}}/assets/img/Screen Shot 2020-01-29 at 7.57.43 PM.png" width="588">


