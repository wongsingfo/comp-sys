---
layout: default
title: OCaml in 30 Minutes
parent: Programming Language
nav_order: 80
---

# OCaml in 30 Minutes
{: .no_toc }

This documentation is intended to give a very very very quick overview of the OCaml programming language.

## References
{: .no_toc .text-delta }

- [tutorial](https://ocaml.org/learn/tutorials/)
- [Language Cheatsheet](http://www.ocamlpro.com/wp-content/uploads/2019/09/ocaml-lang.pdf)
- [Standard Library Cheatsheet](http://www.ocamlpro.com/wp-content/uploads/2019/09/ocaml-stdlib.pdf)

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

There are no implicit coercions (casting) between types. Use `int_of_float` ...

```ocaml
let positive_sum a b = 
  let a = max a 0
  and b = max b 0 in
  a + b;;

let rec listSum (l: int list) =
match l with
    []    ->   0
  | x::y  ->   x + listSum y;;
```

Thunks:

```ocaml
# let unwind_protect body finalize =
    try
  let res = body() in
  finalize();
  res
     with exn ->
  finalize();
  raise exn;;
# let read file =
      let chan = open_in file in
      unwind_protect
  (fun () ->
    let nbytes = in_channel_length chan in
    let string = String.create nbytes in
    really_input chan string 0 nbytes;
    string)
  (fun () -> close_in chan);;
```

References:

```ocaml
let my_ref = ref 0;;
my_ref := 100;;
!my_ref;;

let fact n = 
  let result = ref 1 in 
      for i = 2 to n do 
       result := i * !result 
      done; 
      !result;;
```

## Types

`Unit` is commonly used as the value of a procedure that computes by side-effect.

```ocaml
[1; 3; 2; 5]  (* : int list *)
[]
1 :: [2; 3]
List.hd [1; 2; 3] (* 1 *)
List.tl [1; 2; 3] (* [2; 3] *)
List.append (* or use the @ operator *)

"professor", "age", 33;; (* tuple: string * string * int *)

’a list -> ’a list -> ’a list （* polymorphism *）
```

```ocaml
type shape = Square of float * float * float
           | Circle of float * float * float;;;;
(* shape is a new type, and Square is a constructor *)

type ast =
     ANum of int
  |  APlus of  ast * ast
  |  AMinus of ast * ast
  |  ATimes of ast * ast ;;
```

## Exception

```ocal
exception Bad;;
raise Bad;;
try e with 
    p_1 -> e_1 
  | p_2 -> e_2;;
```

## Modules

| Purpose         | Bytecode | Native code |
| --------------- | -------- | ----------- |
| OCaml Lex       | *.mll    | *.mll       |
| OCaml Yacc      | *.mly    | *.mly       |
| Source code     | *.ml     | *.ml        |
| Header files1   | *.mli    | *.mli       |
| Object files    | *.cmo    | *.cmx2      |
| Library files   | *.cma    | *.cmxa3     |
| Binary programs | prog     | prog.opt4   |

Compiler:

- `ocamlc -c file.ml` 
- `ocamlopt -o a.out *.com`: compile to native code (3x faster) 
- `ocamldebug`: debuger like GNU gdb. Remember to compile with the `-g` option.

import module:

```ocaml
open Graphics             # in file
#load "graphics.cma";;    # in the interactive toplevel
```

There's one module that you never need to "open". That is the `Pervasives` module (go and read `/usr/lib/ocaml/pervasives.mli` now). All of the symbols from the `Pervasives` module are automatically imported into every OCaml program.

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


## IO

```
val stdin : in_channel
val stdout : out_channel
val stderr : out_channel
val open_out: string -> out_channel
val open_out_bin: string -> out_channel
val close_out : out_channel -> unit
val open_in: string -> in_channel
val open_in_bin: string -> in_channel
val open_in_gen: open_flag list -> int -> string -> in_channel
type open_flag = 
  Open_rdonly | Open_wronly | Open_append
        | Open_creat | Open_ trunc | Open_excl
        | Open_binary | Open_text | Open_nonblock
val close_in: out_channel -> unit

val output_char: out_channel -> char -> unit (write a single character)
val output_string: out_channel -> string -> unit (write all the characters in a string)
val output : out_channel -> string -> int -> int -> unit (write part of a string, offset and length)

val input_char: in_channel -> char  (read a single character)
val input_line: in_channel -> string (read an entire line)
val input : in_channel -> string -> int -> int -> int (raise the exception End_of_file if the end of the file is reached before the entire value could be read)
```






