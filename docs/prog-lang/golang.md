---
layout: default
title: Go in 30 Minutes
parent: Programming Language
nav_order: 80
---

# Go in 30 Minutes
{: .no_toc }


## Resources
{: .no_toc .text-delta }

- [goproxy](https://goproxy.cn/)
- [go101](https://go101.org/article/101.html)

## Table of contents
{: .no_toc .text-delta }

1. TOC

{:toc}

## Overview

```go
/// defer, panic, recover
func main() { 
  defer func() {
    str := recover()
		fmt.Println(str)  // PANIC 
  }()
  panic("PANIC")
}

// func

func total(nums ...int) int {
  // nums is of type []int
  for i, num := range nums {
    // ...
  }
}

/// pointer and variable
// := define
//  = assign
var a int
xptr := new(int)
*xptr = 1

/// struct
c := Circle{x: 0, y: 0, r: 5}
cptr := &Circle{0, 0, 5}

func (c *Circle) area() float64 { 
  return math.Pi * c.r * c.r
}

// type embedding
type ApiData struct {
	sync.Mutex
  //... other fields
}
data := ApiData {}
data.Lock() 

// interface
type Shape interface { 
  area() float64
}

```

## Package

```go
package main

import (
  "fmt"
)
```

## Type System

- built-in: string, bool, int8, uint8(byte), int32(rune), ..., float32, complex64, ...
- pointer
- struct
- function
- container: array (fixed-length) `[5]T`, slice (dynamic-length) `[]T`, map `map[Tk]Tv`
- channel
- interface: Each interface value can box a non-interface value in it
  - The dynamic value of the interface value: the value boxed
  - zero interface value: An interface value boxing nothing 
  - If the method set of a type, which is either an interface type or a non-interface type, is the super set of the method set of an interface type, we say the type **implements** the interface type.
- Each type has a zero value, which can be viewed as the default value of the type. `nil` can be used to represent zero value

```go
//Type definition
type (
	MyInt int
	Age   int
	Text  string
)

// Type alias declaration 
type (
	Name = string
	Age  = int
)
type table = map[string]int

```

