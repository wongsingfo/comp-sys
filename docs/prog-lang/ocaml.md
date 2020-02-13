---
layout: default
title: OCaml in 30 Minutes
parent: Programming Language
nav_order: 30
---

# OCaml in 30 Minutes
{: .no_toc }

This documentation is intended to give a very very very quick overview of the OCaml programming language.

## References
{: .no_toc .text-delta }

- [tutorial](https://ocaml.org/learn/tutorials/)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Basic

The semi-colon `;` may be seen as having type `unit -> 'b -> 'b` — it takes two values and simply returns the second one, the first expression is guaranteed to be evaluated before the second.

Outside of the toplevel, uses of `;;` are, at best, infrequent and are never required for well written code. Briefly, double semi-colon `;;` can used for three reasons:

- For compatibility with the toplevel;
- To split the code to ease debugging;
- To introduce a toplevel expression.

```
OCaml type  Range

int         31-bit signed int (roughly +/- 1 billion) on 32-bit
            processors, or 63-bit signed int on 64-bit processors
float       IEEE double-precision floating point, equivalent to C's double
bool        A boolean, written either true or false
char        An 8-bit character
string      A string
unit        Written as ()
```

```ocaml
let positive_sum a b = 
    let a = max a 0
    and b = max b 0 in
    a + b;;
```

```ocaml
let my_ref = ref 0;;
my_ref := 100;;
!my_ref;;
```

## Modules

| Purpose         | Bytecode | Native code |
| --------------- | -------- | ----------- |
| Source code     | *.ml     | *.ml        |
| Header files1   | *.mli    | *.mli       |
| Object files    | *.cmo    | *.cmx2      |
| Library files   | *.cma    | *.cmxa3     |
| Binary programs | prog     | prog.opt4   |

compile them with the following commands:

```
ocamlc -c amodule.mli
ocamlopt -c amodule.ml
```

import module:

```ocaml
open Graphics             # in file
#load "graphics.cma";;    # in the interactive toplevel
```

There's one module that you never need to "open". That is the `Pervasives` module (go and read `/usr/lib/ocaml/pervasives.mli` now). All of the symbols from the Pervasives module are automatically imported into every OCaml program.

submodule:

```ocaml
module type Hello_type = sig
 val hello : unit -> unit  # interfaces go here
end
module Hello : Hello_type = struct
  # implementations go here
  let message = "Hello"
  let hello () = print_endline message
end

(* or, *)

module Hello : sig
 val hello : unit -> unit
end = 
struct
  let message = "Hello"
  let hello () = print_endline message
end
```

## Functor

A functor is a module that is parametrized by another module

```ocaml
module F (X : X_type) : Y_type =
struct
  ...
end

module Int_set = Set.Make (struct
                               type t = int
                               let compare = compare
                           end);;
```

Use the `include` directive to add a function to a existing module:

```ocaml
# module List = struct
    include List
    let rec optmap f = function
      | [] -> []
      | hd :: tl ->
         match f hd with
         | None -> optmap f tl
         | Some x -> x :: optmap f tl
  end;;
```







