---
layout: default
title: Rust in 30 Minutes
parent: Programming Language
nav_order: 10
---

# Rust in 30 Minutes
{: .no_toc }

## References
{: .no_toc .text-delta }

- [Documenation](https://doc.rust-lang.org/std/index.html)
- Book: [The Rust Programming Language](https://doc.rust-lang.org/book/)
- Slides: [Rethinking Systems Programming](https://thoughtram.io/rust-and-nickel/)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

- tool `cargo`: Rust’s package manager and build system
- file `Cargo.toml`: configuration file used by `cargo`

Set up a workspace:

```bash
$ cargo new [name]
$ cargo new [name] --lib  # library project
$ cd [name]
$ cargo run
$ cargo run --package [packet name]
```

## Basic

```rust
const MAX_POINTS: u32 = 100_000;

fn main() {
  let x = 10;
  println!("The value of x is: {}", x);
}

fn  add_one_v1   (x: u32) -> u32 { x + 1 }
let add_one_v2 = |x: u32| -> u32 { x + 1 };
let add_one_v3 = |x|             { x + 1 };
let add_one_v4 = |x|               x + 1  ;

let a: [i32; 5] = [1, 2, 3, 4, 5];
let a = [3; 5]; // [3, 3, 3, 3, 3]

// Criticism: You can not create an array that has mutable element and unmutable pointer, 
// or an array that has unmutable element and mutable pointer.
// In a word, the `mut` modifier makes no sense at all when defining an array.
```

Primitive types:

| Length  | Signed  | Unsigned |
| ------- | ------- | -------- |
| 8-bit   | `i8`    | `u8`     |
| 16-bit  | `i16`   | `u16`    |
| 32-bit  | `i32`   | `u32`    |
| 64-bit  | `i64`   | `u64`    |
| 128-bit | `i128`  | `u128`   |
| arch    | `isize` | `usize`  |
| single  | `f32`   |          |
| double  | `f64`   |          |
| bool    |         |          |
| Unicode | `char`  |          |


Slice:

```rust
let mut s = String::from("hello world");
let slice : &str = &s[..];
--------
let a; // we can initialize `a` later
let a = [1, 2, 3, 4, 5];
let slice : &[i32] = &a[1..3];
```

Print:

{% raw %}

```rust
#[derive(Debug)]
struct Point {
    x: i32,
    y: i32,
}
// or 
impl fmt::Debug for Point {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Point {{ x: {}, y: {} }}", self.x, self.y)
    }
}

let origin = Point { x: 0, y: 0 };
println!("The origin is: {:?}", origin); // The origin is: Point { x: 0, y: 0 }
println!("The origin is: {:#?}", origin); // pretty-print
```

{% endraw %}

## Statements and Expressions

```rust
match guess.cmp(&secret_number) {
  Ordering::Less => println!("Too small!"),
  Ordering::Greater => println!("Too big!"),
  Ordering::Equal => println!("You win!"),
}
let guess: u32 = match guess.trim().parse() {
    Ok(num) => num,
    Err(_) => continue,
};
```

```rust
loop { /* do something */ break; }
while number != 0 { /* do something */ }
for element in (1..4).rev() { /* do something */ }
for (i, &item) in bytes.iter().enumerate() { /* do something */ }
```

```rust
let number = if condition { 5 } else { 6 };
if let Some(3) = some_u8_value { /* do something */ }
```

## Data Structure 

```rust
struct User {
  username: String,
  active: bool,
}

let user1 = User {
  email: String::from("someone@example.com"),
  sign_in_count: 1,
};

// Criticism: `mut` modifier (see the aforementioned comments on array)

let user2 = User {
  email: String::from("another@example.com"),
  ..user1
};

impl User {
  // method
  fn isActive(&self) -> bool {
    self.active
  }
}

// You can have **multiple** impl Blocks
```

Tuple:

```rust
struct Color(i32, i32, i32);
let black = Color(0, 0, 0);
```

Enumeration:

```rust
enum Option<T> {
  Some(T),
  None,
}
let absent_number: Option<i32> = None;
let some_string = Some("a string");
match x {
  Some(i) => Some(i + 1),
  _ => None,
}
```

## Scope and Package

- _Modules_ let us organize code within a crate (see below) into groups for readability and easy reuse. Use `use std::io;` to bring a module or a function / struct / enum /... in a module into scope. Use `use ... as ...` to create alias and `use ...::*` to bring in everything in a module.
- A _crate_ is a binary or library. 
- The _crate root_ is a source file that the Rust compiler starts from and makes up the root module of your crate.
- A _package_ is one or more crates that provide a set of functionality. A package contains a `Cargo.toml` file, which tells all the external packages.

Modules can be nested:

```rust
mod front_of_house {
  mod hosting {
    ...
  }
}
```

By default, all structs, enums, functions, and methods as well as modules are private. We need `pub` modifier to declare them as public.

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() { super::serve_order(); }
    }
    pub fn serve_order() {}
}
pub fn eat_at_restaurant() {
    // Absolute path
    crate::front_of_house::hosting::add_to_waitlist();
    // Relative path
    front_of_house::hosting::add_to_waitlist();
}
```

Sometimes, we may want to seperate the modules into different files:

```rust
mod front_of_house;
pub use crate::front_of_house::hosting;
pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
    hosting::add_to_waitlist();
    hosting::add_to_waitlist();
}
```

## Generic Type

Example:

```rust
struct Point<T, U> {
    x: T,
    y: U,
}
impl<T, U> Point<T, U> {
    fn mixup<V, W>(self, other: Point<V, W>) -> Point<T, W> {
        Point {
            x: self.x,
            y: other.y,
        }
    }
}
```

_Traits_ fundamentally is a generic type other than what is like `interface` in Java. It means that everything is computed at compiled-time and we cannot use dynamic dispatch.

```rust
pub trait Summary {
  fn summarize(&self) -> String {
    String::from("(Read more...)")
  }
}

pub struct NewsArticle {
  pub headline: String,
  pub location: String,
  pub author: String,
  pub content: String,
}
impl Summary for NewsArticle {
  fn summarize(&self) -> String {
    format!("{}, by {} ({})", self.headline, self.author, self.location)
  }
}

pub struct Tweet {
  pub username: String,
  pub content: String,
  pub reply: bool,
  pub retweet: bool,
}
impl Summary for Tweet {
  fn summarize(&self) -> String {
    format!("{}: {}", self.username, self.content)
  }
}

// trait grammmar:
fn notify(item: impl Summary + Display) {}
fn largest<T: PartialOrd + Copy>(list: &[T]) -> T {}
fn returns_summarizable() -> impl Summary {}

// automatically generate the trait implementation
#[derive(Debug, Clone, Copy)]
pub enum Message {
    IncrementPressed,
    DecrementPressed,
}
```

## Ownership

Rule 1: use `&` to represent borrowing (i.e., not having the ownership)
{: .fs-5}

- `fn foo(s: &String)`, `foo(&s)`: use reference semantics (also called borrowing)
- `fn foo(s: &mut String)`, `foo(&mut s)`: mutable reference semantics. You can have only one mutable reference to a particular piece of data in a particular scope so that Rust can prevent data races at compile time. A similar rule exists for combining mutable and immutable references. 
- by default:
  - if the type is not of `Copy` trait, use the move semantics
  - use copy semantics

Rust alleges that it does not need GC to manage the memory. However, this comes at a very high cost; you must write some counter-intuitive code to elate the compiler. Although Rust argues that this coding style saves programming from some subtle bugs, but it does not worth the time spent on fighting with the compiler.

----------------------------------------------------------------

Rule 2: Rust associates each reference or variable with a _lifetime_. The variable must outlives any references that reference to that variable. (Here, the term "variable" means a variable holding the ownership)
{: .fs-5}

In function signatures, sometimes we need the _lifetime annotation_ to specify the lifetime for a reference. If two or more references are annotated with the save lifetime annotation, the acutal lifetime scope is the overlaps with the scope of all annotated variables.

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
  if x.len() > y.len() { x } else { y }
}
```

Lifetimes on function or method parameters are called _input lifetimes_, and lifetimes on return values are called _output lifetimes_. The compiler uses three rules to figure out what lifetimes references have when there aren’t explicit annotations (If the compiler gets to the end of the three rules and there are still references for which it can’t figure out lifetimes, the compiler will stop with an error):

- each parameter that is a reference gets its own lifetime parameter
- if there is exactly one input lifetime parameter, that lifetime is assigned to all output lifetime parameters
- if there are multiple input lifetime parameters, but one of them is `&self` or `&mut self` because this is a method, the lifetime of `self` is assigned to all output lifetime parameters. 

One special lifetime is `'static`, which means that this reference can live for the entire duration of the program. 

## Testing

Run `cargo test`.

Filename: src/lib.rs

```rust
#[cfg(test)]
mod tests {
  #[test]
  fn it_works() {
      assert_eq!(2 + 2, 4);
      panic!("Make this test fail");
  }

  #[test]
  #[should_panic]
  fn it_also_works() {
      panic!("This test won't fail");
  }

  #[test]
  #[should_panic(expected = "Guess value must be less than or equal to 100")]
  fn greater_than_100() {
      Guess::new(200);
  }
}
```

## I/O

```rust
let f = File::open("hello.txt");
let f = match f {
  Ok(file) => file,
  Err(error) => {
    panic!("Problem opening the file: {:?}", error)
  },
};

let f = File::open("hello.txt").unwrap();
let f = File::open("hello.txt").expect("Failed to open hello.txt");
```

## Thread

Rust uses the green-threading M:N model, which means the programming language provide their own special implementation of threads (known as _green threads_), and there are M green threads per N operating system threads. The green-threading M:N model requires a larger language runtime to manage threads. As such, the Rust standard library only provides an implementation of 1:1 threading.

```rust
use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {} from the spawned thread!", i);
            thread::sleep(Duration::from_millis(1));
        }
    });

    handle.join().unwrap();

    for i in 1..5 {
        println!("hi number {} from the main thread!", i);
        thread::sleep(Duration::from_millis(1));
    }
}
```

## Dependencies

Edit the file `Cargo.toml`, then run `cargo update`:

```
[dependencies]
rand = "0.6.0"
```