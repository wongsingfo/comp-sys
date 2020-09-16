---
layout: default
title: Synchronization
parent: Computer System
nav_order: 21
---

# Synchronization
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}


When synchronization is not necessary:

- interrupt handlers and tasklets need not to be coded as reentrant functions. (**All interrupt handlers acknowledges the interrupt on the PIC and also disable the corresponding IRQ line**)
- Per-CPU variables accessed by softirqs and tasklets only do not require synchronization.
- A data structure accessed by only one kind of tasklet does not require synchronization.

## Kernel Preemption

A process running in Kernel Mode can be replaced by another process with higher prioritity, while in the middle of a kernel function (exception handler, in particularly a syscall). 

Motivation: reduce the _dispatch latency_, that is, the delay between the time they become runnable and the time they actually begin running.

Although adding full preemption was not a major change to the kernel (because we just disable the preemption in the code protected by locks), Kernel Preemption introduces a nonnegligible overhead.

```c
// include/linux/smp.h
#define get_cpu()		({ preempt_disable(); smp_processor_id(); })
#define put_cpu()		preempt_enable()
```

There is a counter named `preempt_count` in each `thread_info` structure. A nonzero counter means thath preemption is disabled . It has three components and each component is managed by two functions:

- Hardware interrupt  `irq_enter(), irq_exit()`
- Software interrupt (i.e., softirq), `local_bh_disable(), local_bh_enable()`
- Preemption `preempt_enable(), preempt_disable()`

## Per-CPU variables

General rule: a kernel control path should access a per-CPU variable with kernel preemption disabled.

static: 

- `DEFINE_PER_CPU(type, name)`
- `get_cpu_var(name)`: disable kernel preemption and get the variable
- `put_cpu_var(name)`: enable kernel preemption

dynamic:

- `alloc_percpu(type)`: return a pointer
- `free_percpu(pointer)`
- `per_cpu_ptr(pointer, cpu)`

## Read-Copy Update (RCU)

see `/Documentation/RCU/whatisRCU.txt`

protect data structures that are mostly accessed for reading by several CPUs. It allows

- multiple readers (It is optimized for read-mostly
situations)
- multiple writers
- lock-free

Reader:

- `rcu_read_lock()`
- `rcu_dereference(p)`: returns a value that may then be safely dereferenced and lso executes any memory-barrier instructions required for a given CPU architecture (currently only Alpha). Repeated rcu_dereference() calls do **not** guarantee that the same pointer will be returned if an update happened while in the critical section
- read the data (It is illegal to block while in an RCU read-side critical section, though kernels built with CONFIG_PREEMPT_RCU can preempt RCU read-side critical sections).
- `rcu_read_unlock()`: inform the reclaimer that the reader is exiting an RCU read-side critical section.

Writer:

- makes a copy of the **whole** data structure
- udpate the data structure
- `rcu_assign_pointer(p, typeof(p) v)`: update the pointer to the data structure (**"removal" operation**). This function returns the new value, and also executes any memory-barrier instructions required for a given CPU architecture.
- `synchronize_rcu()`: Marks the end of updater code and the beginning of reclaimer code. It does this by blocking until all pre-existing RCU read-side critical sections on all CPUs have completed.
- `call_rcu(rcu_head, cb)`: a callback form of `synchronize_rcu()`. the `ruc_head` is usually embedded indide the data structure. The `cb` is called when all CPUs have gone through a quiescent state. The `cb` usually frees the old copy of the data structure. (**"reclamation" operation**)

`rcu_assign_pointer()`, `rcu_dereference()` are	typically used indirectly, via the `_rcu` list-manipulation primitives, such as `list_for_each_entry_rcu()`.

The old copy can be freed only after all readers have executed `rcu_read_unlock()`. Periodically, once every tick, the kernel checks whether the local CPU has gone through a _quiescent state_. If all CPUs have gone through a quiescent state, a local tasklet stored in `rcu_tasklet` executes all `cb`s in the list.

## atomic_t

In 80x86:

- Assembly language instructions that make aligned memory access are atomic. Generally speaking, an unaligned memory access is not atomic.
- Read-modify-write assembly language instructions whose opcode is prefixed by the `lock` byte (0xf0) are atomic even on a multiprocessor system.

Linux operations:

- `atomic_read(pointer)`, and others (prefixed by `atomic_`)
- `test_bit(nth, pointer)`, and others (suffixed by `_bit`)

## Memory Barrier

- `mb()`, `rmb()`, `wmb()`: for multiprocessor and uniprocessor
- `smp_mb()`, `smp_rmb()`, `smp_wmb()`: for multiprocessor only

## Lock

The area protected by locks runs with kernel preemption disabled.

- spin lock
- reader-writer lock

### sequential locks (seq lock)

- writer is protected by spin lock
- reader check if the sequence numbers at the begin end end of critical section are the same.
- This is not as cache friendly as brlock.

```c
do {
    seq = read_seqbegin(&foo);
    ...
} while (read_seqretry(&foo, seq));
```

```
seqcount_t		running;
```

### big reader lock (brlock)

patch: https://lwn.net/Articles/378781/

Brlock Make read-only locking as fast as possible through the creation of a per-CPU array of spinlocks. 

- read: Whenever a CPU needs to acquire the lock for read-only access, it takes its own dedicated lock. So read-locking is entirely CPU-local, involving no cache line bouncing. Since contention for a per-CPU spinlock should really be zero, this lock will be fast.
- write:  The unlucky CPU must go through the entire array, acquiring every CPU's spinlock.

Usecase:  vfsmount_lock (where, write rarely occurs). 

## lockdep

Runtime locking correctness validator.

references:

- https://www.kernel.org/doc/html/latest/locking/lockdep-design.html
- https://lwn.net/Articles/185666/

The validator tracks the ‘usage state’ of lock-classes, and it tracks the dependencies between different lock-classes. 

A class of locks is a group of locks that are logically the same with respect to locking rules.  Once the kernel has seen how locking is handled for one instantiation, it knows how it will be handled for every instantiations. 

Some tests:

- The code looks at all other locks which are already held when a new lock is taken. For all of those locks, the validator looks for a past occurrence where any of them were taken *after* the new lock. If any such are found, it indicates a violation of locking order rules, and an eventual deadlock.
- Any spinlock which is acquired by a hardware interrupt handler can never be held when interrupts are enabled.
- Any lock being released should be at the top of the stack

## Semaphores

If the semaphore is not available, wait in `TASK_UNINTERRRETIBLE` state and switch to another runnable process.

## Reference counting

Many data structures can indeed have two levels of reference counting, when there are users of different `classes`. The subclass count counts the number of subclass users, and decrements the global count just once when the subclass count goes to zero.





