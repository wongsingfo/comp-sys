---
layout: default
title: Timing
parent: Computer System
nav_order: 20
mathjax: false
---

# Timing
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Circuits

| Name                              |                                           | Precision                 | I/O port                           | interrupt |
| --------------------------------- | ----------------------------------------- | ------------------------- | ---------------------------------- | ---- |
| Real Time Clock (RTC)             | independent hardware with a small battery. can be accessed by `/dev/rtc` device file | 0.12 ~ 500 ms             | `0x70-0x80` | IRQ8 |
| Time Stamp Counter (TSC)          | in CPU; increased at each clock signal. can be read by instruction `rdtsc` | depend on CPU clock ticks |  |  |
| Programmable Interval Timer (PIT) | may be adjusted if the computer is synchronized with an external clock. | 1 ~ 10 ms | `0x40-0x43` | IRQ0; to all CPUs |
| CPU Local Timer | at local APIC. can be programmed to issue interrupts at very low freq. | Based on bus clock signal |  | vector 239 (`0xef`); local interrupt |
| High Precision Event Timer (HPET) | can be programmed | 100 ~ ? ns | memory-map I/O |  |
| ACPI Power Management Timer (ACPI PMT) | when the CPU voltage is lowered, the frequency does not change (TSC does!). | fixed: 279 ns | the port is determined by BIOS |  |

- In a uniprocessor system, all time-keeping activities are triggered by interrupts raised by global timer.
- In a multi-process system, 
  - the general activities are triggered by interrupts raised by global timer (the interrupt handler is `timer_interrupt()`), 
  - while the CPU-specific activities are triggered by local APIC timer (the interrupt handler is `apic_timer_interrupt()`).

The Linux kernel tries to set the hardware to raise interrupts on IRQ0 (each interrupt is called a _tick_) and at a frequency of 1000 Hz. In addition, it tries to use the best timer source available in the system.
{: .fs-5 }

## jiffies and xtime

`jiffies` is a 32-bit counter that stores the number of elapsed ticks since the system started. It is increased by one when a timer interrupt occurs. It wraps around in appropriate 50 days (2^32 / 1000 / 86400). It is initialized to -300,000, so that it will overflow in 5 minutes and the buggy code will show up.

There is another counter, a 64-bit `jiffies_64`. The kernel needs Seqlock to protect it in 32-bit architecture.

----------------------------------------------------------------

`xtime` stores:

- `tv_sec`: seconds since January 1, 1970 UTC
- `tv_nsec`: nanoseconds whin the last second

It is usually updated once in a tick.

----------------------------------------------------------------

The return values of the syscalls `gettimeofday() / time()` are calculated depenging on these two variables.

## Sub-Tick Resolution

The kenrl can achieve sub-tick resolution by consulting the hardware. This is called _time interpolation_. In addition, The kernel can _delay_ for a given nubmer of _loops_. Here is a table showing the resolution:

| hardware | interpolation | delay      |
| -------- | ------------- | ---------- |
| HPET     | HPET          | HPET       |
| ACPI PMT | ACPI PMT      | TSC        |
| TSC      | TSC           | TSC        |
| PIT      | PIT           | Tight loop |

Sub-Tick Resolution is usually used by device drivers.

## Interrupt

On every timer interrupt, the kernel:

- Checks how long the current process has been running. Update its time spent on Kernel mode (`stime`) and User mode (`utime`).
- Profile the kernel code. It fetches the value of `eip` to discover what the kernel was doing before interrupt. In the long run, the samples accumulated on the hot spots.
- Check the NMI watchdog. The `apic_timer_irqs` of the nth entry of the `irq_stat` array is increased by one on every local APIC timer interrupt. The watchdog chcks if the timer is increased properly. If not, there might be a deadlock when the interrupts are disabled.

## Software Timer

The checking for the software timer is done by deferrable functions, so the kernel can only ensure the timer are executed with in a delay of up to a few hundred of milliseconds. Therefore, the software timer is not appropriate for real-time applications.

The Linux kernel use time wheel for dynamic timers. The data structure is a per-CPU variable named `tvec_bases`. Each element of it is a time wheel. The time wheel resolutions are 255, 2^14, 2^20, 2^26, 2^32 ticks, respectively. 

Use `nanosleep()` syscall to register a software timer and suspend the processor.
