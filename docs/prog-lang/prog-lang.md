---
layout: default
title: Programming Language
nav_order: 20
permalink: docs/prog-lang
has_children: true
---


# Programming Language 

Reference:

- Types and Programming Languages
- Essentials of Programming Languages
- Programming Language Pragmatics

Way to define _syntax_:

- Grammar
- Terms
  - inductively: inference rules = axioms + proper rules
  - concretely

_Semantics_ styles:

- Operational Semantics:
  - terms as states
  - transition between states as simplification
  - _meaning_ of t is the final state starting from the t
- Denotational Semantics:
  - defining an interpretation function mapping terms into elements of a collection of _semantic domains_.
- Axiomatic Semantics:
  - take the laws (properties) as the definition
  - the meaning of a term is just what can be proved about it

Evaluation: The _one-step evaluation relation_ is the smallest binary relation on terms satisfying the evaluation rules.

- Uniqueness of normal forms (also known as Confluence): If t →∗ u and t →∗ u′, where u and u′ are both normal forms, then u = u′.
- Termination of Evaluation: For every term t there is some normal form t′ such that t →∗ t′.
- Big-step (also known as "natural semantics") vs small-step: 
  - Big-step often leads to simpler proof
  - Big-step cannot describe computations that do not produce a value (Non-terminating or stuck)

Derivation Tree: Induction on Derivation

A term t is in _normal form_ if no evaluation rule applies to it.

- Every value is in normal form.
- If t is in normal form, then t is a value. (Prove by contradiction then by structural induction).
- A closed term (a term that does not contains any free variables) is _stuck_ if it is in normal form but not a value.

## Lambda

Russell's paradox => halting problem

Alonzo Church and Alan Turing

Lamdash calculus:

- A formal system invented by Alonzo Church in the 1920s
- A core calculus, capturing the language's essential mechanisms

terms = 

- x     (variable)
- λx. t (abstraction)
- t t   (application)

- alpha renaming
- beta redution (evaluation strategy): λ is confluent.
  - full beta redution 
  - normal order: the lerftmost first
  - call by name: no redutions inside abstraction; the leftmost reduced first
  - call by need: lazy evaluation
  - call by value: reduced only when the right-hand side is a value; the outermost reduced first

Church Boolean:

- tru = λt. λ.f t
- fls = λt. λ.f f
- test = λl. λm. λn. l m n
- and = λb. λc. b c fls
- or = λb. λc. b tru c
- not = λb. b fls tru 

Church Numerals:

- 0 = λs. λz. z
- 1 = λs. λz. s z
- 2 = λs. λz. s (s z)
- succ = λn. λs. λz. s (n s z)
- succ = λn. λs. λz. n s (s z)
- plus = λm. λn. λs. λz. m s (n s z)
- times = λm. λn. m (plus n) 0
- iszro = λm. m (λx. fls) tru
- minus = λm. λn. λz. n pred z = λm. λ.n n pred
- pred = λn. λs. λz. n (λg. λh. h (g s)) (λu. z) (λu. u)

Pairs:

- pair = λf. λs. λb. b f s
- fst = λp. p tru
- snd = λp. p fls

Recursion:

- Terms with no normal form are said to _diverge_.
- omega = (λ x. x x) (λ x. x x)
- Y-Combinator
  - Y = λf. (λx. f (x x)) (λx. f (x x))
  - Y will diverge for any f (assuming call-by-value)
- call-by-value Y-Combinator:
  - fix = λf. (λx. f (λy. x x y)) (λx. f (λy. x x y))
  - fix f = f (λy. (fix f) y)
  - [reinvent-y](https://yinwang0.wordpress.com/2012/04/09/reinvent-y)
  - The Little Schemer Page 160 Chapter 9 

de Bruijin presentation: λx. x (λy. y x) x => λ. 0 (λ. 0 1) 0 => λ. 0 (0 0)

## Types

Safety (Soundness) = Progress + Preservation

Well-typed: `t : T`

- Progress: A-well typed term is not stuck
- Preservation: If a well-typed term takes a step of evaluation, then the result term is also well-typed.

Typing relation: the smallest binary relation between terms and types satisfying all instances of typing rules.

Uniqueness of Types (However, in some languages, a term may have multiple types)

Syntactic sugar; Derived form; Abbreviation for a term.

## Reference

computational effect / side effect / impure feature

Haskell expresses side effects using _monadic_ action.

In most programming languages, variables are mutable. A variable provides both

- a name that refers to a previously calculated value, and
- the possibility of overwriting this value with another (which will be referred to by the same name)

In some languages (e.g., OCaml), these features are separate. There are three basic operation: 

- allocation `ref`
- dereference `!`
- assignment `:=`

Aliasing sometimes confounds programmers and compilers:

`lambda r: Ref Nat. lambda s: Ref Nat. (r := 2; s := 3; !r)`

A reference names a _location_ in the _store_ (a.k.a _heap_ or _memory_). We can think of the store as a partial function from locations to values!

Store typing: a finite function mapping locations to types.






