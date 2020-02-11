---
layout: default
title: Concurrency
parent: C++
grand_parent: Programming Language
nav_order: 26
---

# concurrency
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## [thread](https://en.cppreference.com/w/cpp/thread/thread/thread)

```c++
std::thread t1; // t1 is not a thread
std::thread t2(f1, n + 1); // pass by value
std::thread t3(f2, std::ref(n)); // pass by reference
std::thread t4(std::move(t3)); // t4 is now running f2(). t3 is no longer a thread
std::thread t5(&foo::bar, &f); // t5 runs foo::bar() on object f
std::thread t6(b); // t6 runs baz::operator() on object b

t.join()
t.detach()
  
std::this_thread::sleep_for(std::chrono::seconds(1));

std::thread::id this_id = std::this_thread::get_id();
```

## lock

```c++
std::atomic<int> x(0);
x += 1;

std::mutex mtx;
std::condition_variable cond;
condition_variable_any cond_any; //is a generalization of std::condition_variable. Whereas std::condition_variable works only on std::unique_lock<std::mutex>, condition_variable_any can operate on any lock that meets the BasicLockable requirements.

std::unique_lock<std::mutex> guard(mtx); // can not be unlocked
std::lock_guard<std::mutex> guard(mtx);

cv.wait(guard);
cv.wait(guard, []{return i == 1;});

std::shared_mutex mtx; // shared or exclusive
// exclusive: lock(), try_lock(), unlock()
// shared: lock_shared(), try_lock_shared(), unlock_shared()
```

```c++
class SpinLock {
    std::atomic_flag locked = ATOMIC_FLAG_INIT ;
public:
    void lock() {
        while (locked.test_and_set(std::memory_order_acquire)) { ; }
    }
    void unlock() {
        locked.clear(std::memory_order_release);
    }
};
```

## Promise

used for:

- communicate objects between threads
- communicate stateless events

[promise](https://en.cppreference.com/w/cpp/thread/promise):

- set_value
- set_value_at_thread_exit
- set_exception
- set_exception_at_thread_exit
- get_future

[future](https://en.cppreference.com/w/cpp/thread/future):

- get
- wait
- wait_for

[async](https://en.cppreference.com/w/cpp/thread/async):

- launches a new thread and returns a future

```c++
#include <vector>
#include <thread>
#include <future>
#include <numeric>
#include <iostream>
#include <chrono>
 
void accumulate(std::vector<int>::iterator first,
                std::vector<int>::iterator last,
                std::promise<int> accumulate_promise)
{
    int sum = std::accumulate(first, last, 0);
    accumulate_promise.set_value(sum);  // Notify future
}
 
void do_work(std::promise<void> barrier)
{
    std::this_thread::sleep_for(std::chrono::seconds(1));
    barrier.set_value();
}
 
int main()
{
    // Demonstrate using promise<int> to transmit a result between threads.
    std::vector<int> numbers = { 1, 2, 3, 4, 5, 6 };
    std::promise<int> accumulate_promise;
    std::future<int> accumulate_future = accumulate_promise.get_future();
    std::thread work_thread(accumulate, numbers.begin(), numbers.end(),
                            std::move(accumulate_promise));
 
    // future::get() will wait until the future has a valid result and retrieves it.
    // Calling wait() before get() is not needed
    //accumulate_future.wait();  // wait for result
    std::cout << "result=" << accumulate_future.get() << '\n';
    work_thread.join();  // wait for thread completion
 
    // Demonstrate using promise<void> to signal state between threads.
    std::promise<void> barrier;
    std::future<void> barrier_future = barrier.get_future();
    std::thread new_work_thread(do_work, std::move(barrier));
    barrier_future.wait();
    new_work_thread.join();
}


#include <thread>
#include <iostream>
#include <future>
 
int main()
{
    std::promise<int> p;
    std::future<int> f = p.get_future();
 
    std::thread t([&p]{
        try {
            // code that may throw
            throw std::runtime_error("Example");
        } catch(...) {
            try {
                // store anything thrown in the promise
                p.set_exception(std::current_exception());
            } catch(...) {} // set_exception() may throw too
        }
    });
 
    try {
        std::cout << f.get();
    } catch(const std::exception& e) {
        std::cout << "Exception from the thread: " << e.what() << '\n';
    }
    t.join();
}
```

## memory fence

- write / store memory barrier
- data dependency barrier / consume: a weaker form of read barrier. Two loads are performed such that the second depends on the result of the first.
- read / load memory barrier
- general memory barrier
- acquire operation
- release operation

| Value                  | atomicity | not reordered before this load | not reordered after this store | read-modify-write (RMW) |
| ---------------------- | --------- | ------------------------------ | ------------------------------ | ----------------------- |
| `memory_order_relaxed` | o         | x                              | x                              | x                       |
| `memory_order_consume` | o         | if data-dependent              | x                              | x                       |
| `memory_order_acquire` | o         | o                              | x                              | x                       |
| `memory_order_release` | o         | x                              | o                              | x                       |
| `memory_order_acq_rel` | o         | x                              | x                              | o                       |
| `memory_order_seq_cst` | o         | o                              | o                              | o                       |

```c++
void append (int val) {     // append an element to the list
  Node* oldHead = list_head;
  Node* newNode = new Node {val,oldHead};

  // what follows is equivalent to: list_head = newNode, but in a thread-safe way:
  while (!list_head.compare_exchange_weak(oldHead, newNode))
    newNode->next = oldHead;
}

// this weak version is allowed to fail spuriously 
// For non-looping algorithms, compare_exchange_strong is generally preferred.

```


