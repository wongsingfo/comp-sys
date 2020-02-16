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
- A closed term is _stuck_ if it is in normal form but not a value.





