---
layout: default
title: Rust in 30 Minutes
parent: Programming Language
nav_order: 10
---

# Rust in 30 Minutes
{: .no_toc }

This documentation is intended to give a very very very quick overview of the Rust programming language.

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

Split your program into a `main.rs` and a `lib.rs` and move your program’s logic to `lib.rs`.

## Basic

```rust
const MAX_POINTS: u32 = 100_000;

fn main() {
  let x = 10;
  println!("The value of x is: {}", x);
  eprintln!("Application error");
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

let v1 = vec![1, 2, 3];
process::exit(1);
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

```rust
use std::env;

fn main() {
  let args: Vec<String> = env::args().collect();
  println!("{:?}", args);
}
```

## Statements and Expressions

```rust
match guess.cmp(&secret_number) {
  Ordering::Less => println!("Too small!"),
  _ => println!("Too big! or Equal!"),
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

```rust
match x {
  1..=5 => println!("one through five"),
  6 | 7 => println!("six or seven"),
  _ => println!("something else"),

  // 4 | 5 | 6 if y => ...
  // 4 | 5 | (6 if y) => ...  // different from the former
}
match numbers {
  (first, .., last) => {
    println!("Some numbers: {}, {}", first, last);
  },
}
// Using @ to bind to a value in a pattern while also testing it:
match msg {
    Message::Hello { id: id_variable @ 3..=7 } => { 
    /* do something with id_variable */ }
    Message::Hello { id: 10..=12 } => {
    /* do something with id */ }
    Message::Hello { id } => {},
}
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
  // constructor
  fn new(args: &[String]) -> User { /* ... */ }
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
let r = black.0;
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

## Lambda

```rust
let add_one_v2 = |x: u32| -> u32 { x + 1 };
let add_one_v3 = |x|             { x + 1 };
let add_one_v4 = |x|               x + 1  ;
```

**Closures is not of the generic type.**

Closures can capture environment variables in three way, each of which corresponds to a ownership transfer way. Rust will infer which traits to use.

- `Fn` borrows values immutably. If `Fn` is implemented, `FnMut` and `FnOnce` are also implemented.
- `FnMut` borrows values mutably. If `FnMut` is implemented, `FnOnce` is also implemented.
- `FnOnce` takes the ownership. The `Once` part of the name indicates that the closure can’t take ownership of the same variables more than once, so it can be constructed only once. All closures implement `FnOnce`.

Use the `move` keyword before the parameter list to force the closure to take the ownership.

Example: thunk (a kind of lazy evaluation)

```rust
impl<T> Cacher<T>
    where T: Fn(u32) -> u32 {
  fn new(calculation: T) -> Cacher<T> {
    Cacher {
      calculation,
      value: None,
    }
  }
  fn value(&mut self, arg: u32) -> u32 {
    match self.value {
      Some(v) => v,
      None => {
        let v = (self.calculation)(arg);
        self.value = Some(v);
        v
      },
    }
  }
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

We can edit the file `Cargo.toml` to add a crate to the package, then run `cargo update` to download and compile it:

```rust
[dependencies]
rand = "0.6.0"
iced = { path = "../iced" }  // or local crate
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

### Iterator

```rust
pub trait Iterator {
  type Item;
  fn next(&mut self) -> Option<Self::Item>;
}

let v1: Vec<i32> = vec![1, 2, 3];
// use collect() to collect the values from iterators
let v2: Vec<_> = v1.iter().map(|x| x + 1).collect();

assert_eq!(v2, vec![2, 3, 4]);
```

## Traits

### As Generic Type 

_Traits_ can be a generic type other than what is like `template` in C++. 

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

### Dynamic Dispatch

_Inheritance_ has recently fallen out of favor as a programming design solution in many programming languages because it’s often at risk of sharing more code than necessary. For these reasons, Rust takes a different approach, using trait objects instead of inheritance. Let’s look at how trait objects enable polymorphism in Rust.

```rust
pub struct Screen {
    pub components: Vec<Box<dyn Draw>>,
}

impl Screen {
  pub fn run(&self) {
    for component in self.components.iter() {
      component.draw();  // dynamic dispatch!!!!
    }
  }
}
```

Here, `dyn Draw` is called _trait object_. A trait object points to both an instance of a type implementing our specified trait as well as a table used to look up trait methods on that type at runtime. You can only make _object-safe traits_ into trait objects. A trait is object safe if all the methods defined in the trait have the following properties. Otherwise, there is no way to infer the concrete type at compile-time.

- The return type isn’t `Self`.
- There are no generic type parameters.

## Ownership

Rule 1: use `&` to represent borrowing (i.e., not having the ownership)
{: .fs-5}

- `fn foo(s: &String)`, `foo(&s)`: use reference semantics (also called borrowing)
- `fn foo(s: &mut String)`, `foo(&mut s)`: mutable reference semantics. You can have only one mutable reference to a particular piece of data in a particular scope so that Rust can prevent data races at compile time. A similar rule exists for combining mutable and immutable references. 
- by default:
  - if the type is not of `Copy` trait, use the move semantics
  - use copy semantics

Rust alleges that it does not need GC to manage the memory. However, this comes at a very high cost; you must write some counter-intuitive code to elate the compiler. Although Rust argues that this coding style saves programming from some subtle bugs, but it does not worth the time spent on fighting with the compiler.

Use `std::mem::drop` to drop the ownership (need to implement the `Drop` trait, which is similar to the deconstructor):

```rust
drop(sth);
```

Next, we introduce `std::cell::RefCell`. With references and `Box<T>` (will be discussed soon), the borrowing rules’ invariants are enforced at compile time. With `RefCell<T>`, these invariants are enforced at runtime. `RefCell<T>` lets us have many immutable borrows (`borrow() -> Ref`) or one mutable borrow (`borrow_mut() -> RefMut`) at any point in time (use `*` to dereference them). If the program violates this at runtime, the program will panic.

```rust
struct MockMessenger {
  sent_messages: RefCell<Vec<String>>,
}
impl Messenger for MockMessenger {
  fn send(&self, message: &str) {
    let mut borrow = self.sent_messages.borrow_mut();
    borrow.push(String::from(message));
  }
}
```

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

----------------------------------------------------------------

### Pointer

Using `Box<T>` to Point to Data on the Heap. Let's see an example where pointers may be helpful.

```rust
enum List {
    Cons(i32, List), // error: recursive without indirection
    Nil,
}
```

The type `List` is a _recursive type_, where a value can have as part of itself another value of the same type. At compile time, Rust needs to know how much space a type takes up. As a recursive type size is unknown, the compiler will complain. We can fix it by `Box` (also known as indirection). 

```rust
enum List {
    Cons(i32, Box<List>),
    Nil,
}
let list = Cons(1,
    Box::new(Cons(2,
        Box::new(Cons(3,
            Box::new(Nil))))));
```

Implementing the `std::ops::Deref` trait allows you to customize the behavior of the dereference operator, `*`. Also, you can use the `DerefMut` trait to override the `*` operator on mutable references. There are three cases:

- From `&T` to `&U` when `T: Deref<Target=U>`
- From `&mut T` to `&mut U` when `T: DerefMut<Target=U>`
- From `&mut T` to `&U` when `T: Deref<Target=U>`

```rust
struct MyBox<T>(T);
impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}
impl<T> Deref for MyBox<T> {
    type Target = T;
    fn deref(&self) -> &T {
        &self.0
    }
}
// suger:
// `*y` now acutally is `*(y.deref())`
```

---------------------------

Use `Rc<T>` to Share Data. Similar to `shared_ptr` in C++. Use `Rc::strong_count()` to get the count of references. Use `Arc<T>` in concurrent situation; the `a` means "atomically". There are som similarities between `RefCell<T>/Rc<T>` and `Mutex<T>/Arc<T>`.

```rust
enum List {
    Cons(i32, Rc<List>),
    Nil,
}
use crate::List::{Cons, Nil};
use std::rc::Rc;
fn main() {
    let a = Rc::new(Cons(5, Rc::new(Cons(10, Rc::new(Nil)))));
    let b = Cons(3, Rc::clone(&a));
    let c = Cons(4, Rc::clone(&a));
}
// --------------------------------
let value = Rc::new(RefCell::new(5));
let a = Rc::new(Cons(Rc::clone(&value), Rc::new(Nil)));
let b = Cons(Rc::new(RefCell::new(6)), Rc::clone(&a));
let c = Cons(Rc::new(RefCell::new(10)), Rc::clone(&a));
*value.borrow_mut() += 10;
```

However, reference cycles may cause memory leaks. To fix this, use `Rc::downgrade` to create weak pointer. Similar to `weak_ptr` in C++.

```rust
struct Node {
    value: i32,
    parent: RefCell<Weak<Node>>,
    children: RefCell<Vec<Rc<Node>>>,
}
let leaf = Rc::new(...);
let branch = Rc::new(...);
*leaf.parent.borrow_mut() = Rc::downgrade(&branch);
```

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

let contents = fs::read_to_string(filename)
  .expect("Something went wrong reading the file");

impl Config {
  fn new(args: &[String]) -> Result<Config, &'static str> {
    if args.len() < 3 {
      return Err("not enough arguments");
    }

    let query = args[1].clone();
    let filename = args[2].clone();

    Ok(Config { query, filename })
  }
}
```

## Thread

Principles: Do **not** communicate by sharing memory.
{: .fs-5}

------------------------

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

Channel:

```rust
use std::thread;
use std::sync::mpsc;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let val = String::from("hi");
        tx.send(val).unwrap();
    });

    let received = rx.recv().unwrap();
    println!("Got: {}", received);
}
```

We need mutex to protect shared data:

```rust
use std::sync::Mutex;
let m = Mutex::new(5);
let mut num = m.lock().unwrap(); // fail if the thread holds the mutex panicked.
```

As you might suspect, `Mutex<T> `is a smart pointer. More accurately, the call to lock returns a smart pointer called `MutexGuard`, wrapped in a `LockResult `that we handled with the call to unwrap. The `MutexGuard` smart pointer implements `Deref` to point at our inner data; the smart pointer also has a `Drop` implementation that releases the lock automatically when a `MutexGuard` goes out of scope.

------------------------

There are two traits about concurrency: `Send` and `Sync`. `Send` means its ownership can be transferred between threads. `Sync` means it is safe to be referenced from multiple threads. However, implementing them manually is unsafe. They’re just useful for enforcing invariants related to concurrency.

## Foreign Function Interface 

```rust
// define the ABI as "C"
extern "C" {
  fn abs(input: i32) -> i32;
}

fn main() {
  unsafe {
    println!("Absolute value of -3 according to C: {}", abs(-3));
  }
}
```

export:

```rust
#[no_mangle]
pub extern "C" fn call_from_c() {
    println!("Just called a Rust function from C!");
}
```