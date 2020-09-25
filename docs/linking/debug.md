---
layout: default
title: Debugging
parent: Linking
nav_order: 20
---

# Debugging
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}



resources:

- https://binary.ninja/ Reversing Platform
- https://www.godbolt.org/

## GCC options

-g
{{ site.bin_option_style }}

include debugging information in the compiled program

-funwind-tables
{{ site.bin_option_style }}

Tt generates any needed static data for exception handling and allows a running program to walk back the function call stack from a given execution point.

### Strip Debugging Info

-fomit–frame–pointer
{{ site.bin_option_style }}

strip(1)
{{ site.bin_option_style }}

## TODO

DWARF
Debug With Arbitrary Record Format 
http://www.dwarfstd.org/

STABS debugging info
http://sourceware.org/gdb/onlinedocs/stabs.html

