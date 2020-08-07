---
layout: default
title: GDB in 30 Minutes
parent: Script
nav_order: 10
---

# GDB in 30 Minutes
{: .no_toc }

## References
{: .no_toc .text-delta }

- [GDB and LLDB](https://lldb.llvm.org/use/map.html)
- [GDB GUI](https://www.gdbgui.com/)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Thread

```
(gdb) info threads
(gdb) thread n    # focus on thread n

(gdb) set scheduler-locking off|on|step
 off[defalut] : 
 on : 
 step : 
 
(gdb) set follow-fork-mode child
```

## Breakpoint

```
symbol-file file    # Switch symbol file, e.g., obj/user/hello.

info b
d    [num]
disa [num]
ena  [num]

b *0x7c00
b service.cpp:45

tb  # temporary breakpoint
skip [function]
  foo(boring())
  
watch <expression>
watch -l <address>
```

## Running programs backward

```
break main
run
record
reverse-stepi [count]
reverse-continue
```

## Examining Data

```
(gdb) # ask gdb to automatically demangle C++ symbols
(gdb) set print asm-demangle on
(gdb) set print demangle on

(gdb) info symbol 0x400a90
Parent::FooNotOverridden() in section .text of a.out

(gdb) disas /m 0x400820, 0x400850
(gdb) disas $eip, $eip+30

(gdb) p [/format] expr
x hexadecimal
d signed decimal
u unsigned decimal
o octal
t binary
a address, absolute and relative
  (gdb) p/a 0x400fae
  $3 = 0x400fae <phase_1+1>
c character
f floating point

(gdb) whatis x
type = int


(gdb) x [/Nuf] expr

N count of how many units to display
	x/-16b $sp
unit size
  b individual bytes
  h halfwords (two bytes)
  w words (four bytes)
  g giant words (eight bytes)
format
  s null-terminated string
  i machine instructions
  Or any print format
  
(gdb) p/t $rax
$1 = 101100
(gdb) info reg
```

## Frame

```
(gdb) info f
Stack level 0, frame at 0x7fffffffebb0:
 rip = 0x400fad in phase_1; saved rip = 0x400f15
 called by frame at 0x7fffffffebc0
 Arglist at 0x7fffffffeba0, args:
 Locals at 0x7fffffffeba0, Previous frame's sp is 0x7fffffffebb0
 Saved registers:
  rip at 0x7fffffffeba8
  
(gdb) f 5
```

## Changing the behaviors 

```
(gdb) set $rsp += 4
(gdb) set $edx = 1  
	# it would not set the upper 4 bytes of rdx to zero

Special case:
(gdb) set width=47
Invalid syntax in expression.
(gdb) set var width=47

(gdb) set $rip = 0x1234
(gdb) set $pc = 0x1234
(gdb) jump [line]
(gdb) jump *0x1234
  usually combine it with tb *0x1234
  For convenience,
    (gdb) define lalala
        tb +1
        jump +1
    end

(gdb) ret [expr]
#pop selected stack frame without executing
eax = expr
```

## Macro

Programs should be compiled with `-ggdb3`

```
(gdb) info macro
```