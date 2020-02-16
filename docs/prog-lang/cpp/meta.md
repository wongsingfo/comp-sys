---
layout: default
title: Meta Programming
parent: C++ in 30 Minutes
grand_parent: Programming Language
nav_order: 26
---

# Meta Template Programming
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

References:

- [fluentcpp: How to Make SFINAE Pretty](https://www.fluentcpp.com/2018/05/15/make-sfinae-pretty-1-what-value-sfinae-brings-to-code/)

1. TOC
{:toc}

## [SFINAE](https://en.cppreference.com/w/cpp/language/sfinae)

"Substitution Failure Is Not An Error"

The point of SFINAE is to deactivate a piece of template code for certain types.

```cpp
template<typename T>
using IsNotReference = std::enable_if_t<!std::is_reference_v<T>>;
 
template<typename T>
class MyClass
{
public:
    void f(T const& x){}
    
    template<typename T_ = T, typename = IsNotReference <T_>>
    void f(T&& x){}
};
```

## [Whether an expression is valid](https://www.fluentcpp.com/2017/06/02/write-template-metaprogramming-expressively/)

```cpp
template<typename...>
using try_to_instantiate = void;
 
using disregard_this = void;
 
template<template<typename...> class Expression, typename Attempt, typename... Ts>
struct is_detected_impl : std::false_type{};
 
template<template<typename...> class Expression, typename... Ts>
struct is_detected_impl<Expression, try_to_instantiate<Expression<Ts...>>, Ts...> : std::true_type{};
 
template<template<typename...> class Expression, typename... Ts>
constexpr bool is_detected = is_detected_impl<Expression, disregard_this, Ts...>::value;

template<typename T, typename U>
using assign_expression = decltype(std::declval<T&>() = std::declval<U&>());
 
template<typename T, typename U>
constexpr bool is_assignable = is_detected<assign_expression, T, U>;

static_assert(is_assignable<int, double>, "");
static_assert(!is_assignable<int, std::string>, "");
```

## Type Traits


### Is the same type

```cpp
template <typename T, typename U>
struct is_same_type
{ static constexpr bool value {false}; };

template <typename T>
struct is_same_type<T, T>
{ static constexpr bool value {true}; };
```

### [Get the Argument Type](https://stackoverflow.com/questions/9065081/how-do-i-get-the-argument-types-of-a-function-pointer-in-a-variadic-template-cla)

```cpp
template<typename T> 
struct function_traits;  

template<typename R, typename ...Args> 
struct function_traits<std::function<R(Args...)>>
{
    static const size_t nargs = sizeof...(Args);

    typedef R result_type;

    template <size_t i>
    struct arg
    {
        typedef typename std::tuple_element<i, std::tuple<Args...>>::type type;
    };
};

struct R{};
struct A{};
struct B{};

int main()
{
   typedef std::function<R(A,B)> fun;

   std::cout << std::is_same_type<R, function_traits<fun>::result_type>::value << std::endl;
   std::cout << std::is_same_type<A, function_traits<fun>::arg<0>::type>::value << std::endl;
   std::cout << std::is_same_type<B, function_traits<fun>::arg<1>::type>::value << std::endl;
} 
```

## [Currying](https://github.com/Light-of-Hers/Cpp-curry-partial-and-other-FP-combinators)

```cpp
template<typename F, typename TA, typename A, typename ...As>
class __curry_cacher<F, TA, std::tuple<A, As...>> {
    F f;
    TA cached_args;
public:
    __curry_cacher(F f, TA args) : f(std::move(f)), cached_args(std::move(args)) {}
    auto operator()(A arg) {
        auto new_cached_args = std::tuple_cat(
                __copy_or_move(cached_args),
                std::tuple<A>(std::forward<A>(arg)));
        return __curry_cacher<F,
                decltype(new_cached_args),
                std::tuple<As...>>(__copy_or_move(f), std::move(new_cached_args));
    }
}
```





