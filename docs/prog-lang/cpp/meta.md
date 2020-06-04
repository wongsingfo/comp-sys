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

## Common

- [type_traits](https://en.cppreference.com/w/cpp/header/type_traits)

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

### [Type Trait](https://zhuanlan.zhihu.com/p/102240099)

```c++
namespace detail {

template<typename R, typename ...As>
struct __function_traits_base {
    using function_type = std::function<R(As...)>;

    using result_type = R;

    using argument_types = std::tuple<As...>;
};

template<typename F>
struct __function_traits;
template<typename F>
struct __function_traits<std::reference_wrapper<F>> : public __function_traits<F> {};
template<typename R, typename ...As>
struct __function_traits<R(*)(As...)> : public __function_traits_base<R, As...> {};
template<typename R, typename C, typename ...As>
struct __function_traits<R(C::*)(As...)> : public __function_traits_base<R, As...> {};
template<typename R, typename C, typename ...As>
struct __function_traits<R(C::*)(As...) const> : public __function_traits_base<R, As...> {};
template<typename F>
struct __function_traits : public __function_traits<decltype(&F::operator())> {};

}

namespace fp {

template<typename F>
struct function_traits : public detail::__function_traits<std::decay_t<F>> {};

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

## [assign](http://blog.kongfy.com/2017/06/c%e5%ae%9e%e7%8e%b0%e6%88%90%e5%91%98%e5%87%bd%e6%95%b0%e6%a3%80%e6%9f%a5/)


```cpp
template<bool, typename T> struct __has_assign__;
 
template <typename T>
struct __has_assign__<true, T>
{
    typedef int (T::*Sign)(const T &);
    typedef char yes[1];
    typedef char no[2];
    template <typename U, U>
    struct type_check;
    template <typename _1> static yes &chk(type_check<Sign, &_1::assign> *);
    template <typename> static no &chk(...);
    static bool const value = sizeof(chk<T>(0)) == sizeof(yes);
};
 
template <typename T>
struct __has_assign__<false, T>
{
    static bool const value = false;
};

template <bool c>
struct BoolType
{
    static const bool value = c;
};
typedef BoolType<false> FalseType;
typedef BoolType<true> TrueType;

template <typename T>
inline int copy_assign_wrap(T &dest, const T &src, TrueType c)
{
    return dest.assign(src);
}
 
template <typename T>
inline int copy_assign_wrap(T &dest, const T &src, FalseType c)
{
    dest = src;
    return 0;
}
 
// 此函数用于拷贝赋值
// - 如果T有成员函数int assign(const T &)，则调用dest.assign(src)，
//   并以assign函数的返回值作为返回值；
// - 如果T没有成员函数int assign(const T &)，则调用dest=src，
//   并返回0。
template <typename T>
inline int copy_assign(T &dest, const T &src)
{
    return copy_assign_wrap(dest, src, BoolType<__has_assign__<__is_class(T), T>::value>());
}
```


