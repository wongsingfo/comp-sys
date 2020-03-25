---
layout: default
title: Context
parent: Programming Language
nav_order: 1
---

# Context
{: .no_toc }

Here, the term "_context_" denotes a set of properties that describe the execution status of a program. For example, from the perspective of the process, a context includes the values in registers, the address space of the stack, the address space of the heap, and so on. During the process of context switching, the scheduler must take care of the saving and restoring of the running states.

Next, we are going to discuss the program context from the perspective of the programming language.

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## coroutine

Coroutine, also known as co-operative routines, are a set of subroutines that work together. When a coroutine has done it works, it selflessly and voluntarily yields the CPU to other coroutines. That's why we say coroutines are for _non-preemptive multitasking_.

A well-known classification of coroutines concerns the control-transfer operations that are provided and distinguishes the concepts of _symmetric_ and _asymmetric coroutines_ (see [this paper](http://www.inf.puc-rio.br/~roberto/docs/MCC15-04.pdf)). 

- Symmetric coroutine facilities provide a single control-transfer operation that allows coroutines to explicitly pass control between themselves. 
- Asymmetric coroutine mechanisms (more commonly denoted as semi-symmetric or semi coroutines) provide two control-transfer operations: one for invoking a coroutine and one for suspending it, the latter returning control to the coroutine invoker. The popular `yield` operator is a kind of asymmetric coroutines.

In terms of expressiveness, symmetric and asymmetric coroutines are equivalent; but they ara not equivalent in terms of use. Handling and understanding the control flow of a program that employs even a moderate number of symmetric coroutines may require a considerable effort from a programmer.

By the way, we can easily implement semaphores / message queues with coroutines.

## continuation

In functional programming, _Continuation_ is a running context of a function. People often use the variable name `K` to represent a continuation.

_Continuation-passing style_ (CPS) is a style of programming in which control is passed explicitly in the form of a continuation. Here is an example in javascript.

```js
function fact(n, ret) {
  if (n == 0)
    ret(1);
  else
    fact(n-1, function (t0) {
     ret(n * t0) 
    });
}

fact(5, function (n) { 
  console.log(n); // Prints 120
})
```

CPS bascially satisfies the constraints: 
**No procedure returns to its caller.**

We can always convert a function in to CPS. Here is an excerpt of a project that do this job. It is trying to convert a `while` statement into CPS.

```js
AST._while.prototype.compile = function(K) {
  var self = this;
  var t1 = this.condition.compile(function(cond) {
    var t2 = self.body.compile(function(body) {
      return join_exp(body, 'loop(K2);\n');
    });
    return format_str('if (%1) {\n%2} else K2();\n', cond, t2);
  });
  return format_str(
    '(function loop(K2) {GUARD(loop, arguments); ' +
    'function step(){};\n%1})(function() {\n%2})\n',
    t1, K()
  );
}
```

`call/cc` (call-with-current-continuation) is an operation that exposes the a subroutine context to the operant that is a function accepting the caller's context. With `call/cc`, we can easily manage the program control flow.

```scheme
(define (f return)
  (return 2)
  3)

(display (call-with-current-continuation f)) ; displays 2
```

## program context in C

Here are some posibilities for the C programming language:

- The C standard library provides us with the ability to interact with context: [setjmp/longjmp](http://zh.wikipedia.org/wiki/Setjmp.h) and [ucontext](http://pubs.opengroup.org/onlinepubs/7990989799/xsh/ucontext.h.html). 
- The GNU Pth implements a user-space multithreading environment. Its author wrote [a paper](http://xmailserver.org/rse-pmt.pdf) about it. 
- The [libaco](https://github.com/hnes/libaco) provides a blazing fast and lightweight C asymmetric coroutine library.

Here, let us see how the [protothreads](http://dunkels.com/adam/pt/index.html), a extremely lightweight stackless threads designed for severely memory constrained systems, implement the `yield` semantics. The code below shows its key insight:

```c
#define _CONCAT(s1, s2) s1##s2
#define CONCAT(s1, s2) _CONCAT2(s1, s2)

#define Begin() \
  static void *state = NULL;
  if (state != NULL) { \
    goto *s; \
  }
#define Yield(x) do { \
    CONCAT(LC_LABEL, __LINE__): \
    (state) = &&CONCAT(LC_LABEL, __LINE__); \
  } while (0)
#define End() return ...;

int function(void) {
  static int i;
  Begin();
  for (i = 0; i < 10; i++)
    Yield(i);
  End();
}
``` 

