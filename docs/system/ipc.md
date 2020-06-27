---
layout: default
title: IPC
parent: Computer System
nav_order: 21
---

# IPC
{: .no_toc }

Reference:

- UNIX Network Programming, Volumn 2

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Overview

Persistency of IPC objects:

- Process-persistency: pipe, FIFO
- Kernel-persistent: System V message queue, semaphores, shared memory; Posix message queue, semaphores, shared memory
- Filesystem-persistent: Posix message queue, semaphores, shared memory (depending on the implementation)

|                              | namespace      | Identifier              | Op       | Persistency |
| ---------------------------- | -------------- | ----------------------- | -------- | ----------- |
| Pipe                         |                | fd                      | `popen`  | Process     |
| FIFO                         | pathname       | fd                      | `mkfifo` | Process     |
| Posix mutex                  |                | `pthread_mutex_t`       |          | Process     |
| Posix condition variable     |                | `pthread_cond_t`        |          | Process     |
| Posix read-write lock        |                | `pthread_rwlock_t`      |          | Process     |
| `fcntl` record locking       |                | fd                      |          | Process     |
| Posix message queue          | Posix IPC name | `mqd_t`                 | `mq_`    | kernel      |
| Posix named semaphore        | Posix IPC name | `sem_t`                 | `sem_`   | kernel      |
| Posix memory-based semaphore |                | `sem_t`                 |          | Process     |
| Posix shared memory          | Posix IPC name | fd                      | `shm_`   | kernel      |
| System V message queue       | `key_t`        | System V IPC identifier | `msg`    | kernel      |
| System V semaphore           | `key_t`        | System V IPC identifier | `sem`    | kernel      |
| System V shared memory       | `key_t`        | System V IPC identifier | `shm`    | kernel      |

Posix IPC:

- The namespace comes with portability problem. Ususally we use a wrapper function.

System V:

- `key_t ftok(pathname, id)` : a 32-bit key based on 1. `st_dev`, i-node number `st_info`, and the low-order 8 bits of `id`. No guarantee exists that two different pathnames combined with the same `id` generate different keys.
-  IPC identifier: 
  - `IPC_PRIVATE`, or
  - `key_t`
- list and remove: `ipcs` and `ipcrm`

## Pipe / FIFO

- either the client or sever could call `unlink` on it, because the kernel keeps a reference count of the file descriptors. (But this may be not ture for other IPC)
- **aotmic** IO: `PIPE_BUF` (at least 512 bytes)

## futex

a system call: fast user-space locking. futexes are not really for regular user code; rather, they are used by low-level runtimes and libraries to implement (e.g. `pthread_mutex_t`)  other, higher-level primitives.

```c
int futex(int *uaddr, int futex_op, int val,
          const struct timespec *timeout,   /* or: uint32_t val2 */
          int *uaddr2, int val3);
// FUTEX_WAIT: if *uaddr == val, sleeps wating for a FUTEX_WAKE
// FUTEX_WAKE: wakes at most val of the waiters on the futex word at the address uaddr
```

reference:

- https://eli.thegreenplace.net/2018/basics-of-futexes/#id9
- https://man7.org/linux/man-pages/man2/futex.2.html
- https://lwn.net/Articles/360699/

a simple mutex implementation:

```c++
class Mutex {
public:
  Mutex() : atom_(0) {}

  void lock() {
    int c = cmpxchg(&atom_, 0, 1);
    // If the lock was previously unlocked, there's nothing else for us to do.
    // Otherwise, we'll probably have to wait.
    if (c != 0) {
      do {
        // If the mutex is locked, we signal that we're waiting by setting the
        // atom to 2. A shortcut checks is it's 2 already and avoids the atomic
        // operation in this case.
        if (c == 2 || cmpxchg(&atom_, 1, 2) != 0) {
          // Here we have to actually sleep, because the mutex is actually
          // locked. Note that it's not necessary to loop around this syscall;
          // a spurious wakeup will do no harm since we only exit the do...while
          // loop when atom_ is indeed 0.
          syscall(SYS_futex, (int*)&atom_, FUTEX_WAIT, 2, 0, 0, 0);
        }
        // We're here when either:
        // (a) the mutex was in fact unlocked (by an intervening thread).
        // (b) we slept waiting for the atom and were awoken.
        //
        // So we try to lock the atom again. We set teh state to 2 because we
        // can't be certain there's no other thread at this exact point. So we
        // prefer to err on the safe side.
      } while ((c = cmpxchg(&atom_, 0, 2)) != 0);
    }
  }

  void unlock() {
    if (atom_.fetch_sub(1) != 1) {
      atom_.store(0);
      syscall(SYS_futex, (int*)&atom_, FUTEX_WAKE, 1, 0, 0, 0);
    }
  }

private:
  // 0 means unlocked
  // 1 means locked, no waiters
  // 2 means locked, there are waiters in lock()
  std::atomic<int> atom_;
};

// An atomic_compare_exchange wrapper with semantics expected by the paper's
// mutex - return the old value stored in the atom.
int cmpxchg(std::atomic<int>* atom, int expected, int desired) {
  int* ep = &expected;
  std::atomic_compare_exchange_strong(atom, ep, desired);
  return *ep;
}
```



