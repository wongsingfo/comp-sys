---
layout: default
title: C++ in 30 Minutes
parent: Programming Language
nav_order: 30
permalink: docs/prog-lang/cpp
has_children: true
---

# C++ in 30 Minutes
{: .no_toc }

Recommend:

- [CppCoreGuidelines](http://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines)

Interesting Facts:

- [Stack Overflow: How do exceptions work?](https://stackoverflow.com/questions/307610/how-do-exceptions-work-behind-the-scenes-in-c)

> So, the conclusion, at least for GCC on Linux: the cost is extra space (for the handlers and tables) whether or not exceptions are thrown, plus the extra cost of parsing the tables and executing the handlers when an exception is thrown. If you use exceptions instead of error codes, and an error is rare, it can be faster, since you do not have the overhead of testing for errors anymore.

References:

- [godbolt](https://godbolt.org)
- [cppreference](https://en.cppreference.com)

