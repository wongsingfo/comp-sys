---
layout: default
title: Reference
parent: C++ in 30 Minutes
grand_parent: Programming Language
nav_order: 20
---

# Left / Right Reference
{: .no_toc }

reference:

- [cppreference: Value categories](https://en.cppreference.com/w/cpp/language/value_category)
- [cppreference: Reference declaration](https://en.cppreference.com/w/cpp/language/reference)
- [cppreference: Lifetime](https://en.cppreference.com/w/cpp/language/lifetime)
- [chromium: smart pointer guide](https://www.chromium.org/developers/smart-pointer-guidelines)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Value

Each C++ expression (an operator with its operands, a literal, a variable name, etc.) is characterized by two independent properties: a type and a value category. Each expression belongs to exactly one of the three primary value categories:

- prvalue (c++17)
- xvalue (eXpiring)
- lvalue

- An rvalue is a prvalue or an xvalue. 
- A glvalue (generalized lvalue) is either lvalue or xvalue.

## Reference

References are not objects; 

- they do not necessarily occupy storage, although the compiler may allocate storage if it is necessary to implement the desired semantics (e.g. a non-static data member of reference type usually increases the size of the class by the amount necessary to store a memory address).
- Because references are not objects, there are no arrays of references, no pointers to references, and no references to references.

Reference collapsing:

- `&& && -> &&`
- `&& & -> &`
- `& & -> &`
- `& && -> &`

Universal reference `template <typename T> T &&` or `auto &&`:

- for lvalue, `T = T&`
- for rvalue, `T = T`

Rvalue references can be used to extend the lifetimes of temporary objects:

```c++
#include <iostream>
#include <string>
 
int main() {
    std::string s1 = "Test";
//  std::string&& r1 = s1;           // error: can't bind to lvalue
 
    const std::string& r2 = s1 + s1; // okay: lvalue reference to const extends lifetime
//  r2 += "Test";                    // error: can't modify through reference to const
 
    std::string&& r3 = s1 + s1;      // okay: rvalue reference extends lifetime
    r3 += "Test";                    // okay: can modify through reference to non-const
    std::cout << r3 << '\n';
}
```

Lifetime:

- The lifetime of a reference begins when its initialization is complete and ends as if it were a scalar object.
- The lifetime of a temporary object may be extended by binding to a **const** lvalue reference or to an rvalue reference

```c++
int main {
	int i = 0;
	int &&w = std::move(i);
	foo(w); // the lifetime of w ends
	foo(w); // UB
}
```




