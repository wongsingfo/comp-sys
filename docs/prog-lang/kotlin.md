---
layout: default
title: Kotlin in 30 Minutes
parent: Programming Language
nav_order: 30

---

# Kotlin in 30 Minutes
{: .no_toc }

## References
{: .no_toc .text-delta }

- [Tutorials](https://kotlinlang.org/docs/reference/basic-syntax.html)
- [Kotlin vs. Java](https://kotlinlang.org/docs/reference/comparison-to-java.html)

## Table of contents
{: .no_toc .text-delta }

1. TOC

{:toc}

## Basic

expression

```kotlin
when (boolean) {
    a -> A
    b -> B
    else -> C
}
if (boolean) A else B
```

annotation

```kotlin
@JvmStatic
@Throws(IOException::class)
fun ....

@get:Synchronized
var a = 10
set(x) {
    synchronized(this) {
        field = x // a = x
    }
}

// don't generate getter/setter
@JvmField
val CONNECTION_PREFACE = "PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n".encodeUtf8()
```

## Null

```kotlin
var a: String = "abc" // cannot hold null
var b: String? = "abc" // can hold null

println(b?.length) // of type Int?

// ?. and ?.let
person?.department?.head = managersPool.getManager()
item?.let { println(it) } // prints Kotlin and ignores null

// ?:
val l: Int = if (b != null) b.length else -1
val l = b?.length ?: -1
  // Elvis Operator
  val name = node.getName() ?: throw IllegalArgumentException("name expected")

// !! for NPE-lovers
// converts any value to a non-null type and 
//  throws an exception if the value is null
val l = b!!.length

// cast
val aInt: Int? = a as? Int // return null if the attempt was not successful
```

## Type System

variance:

```kotlin
interface Source<out T> {
    fun nextT(): T
}
```

generisis

```kotlin
fun <T : Comparable<T>> sort(list: List<T>) {  ... }
fun <T> copyWhenGreater(list: List<T>, threshold: T): List<String>
    where T : CharSequence,
          T : Comparable<T> {
    return list.filter { it > threshold }.map { it.toString() }
}
class Array<T>(val size: Int) { ... }
```

## FP

lambda:

```kotlin
// Lambdas are code blocks enclosed in curly braces.
items.fold(0, { 
    // When a lambda has parameters, they go first, followed by '->'
    acc: Int, i: Int -> 
    print("acc = $acc, i = $i, ") 
    val result = acc + i
    println("result = $result")
    // The last expression in a lambda is considered the return value:
    result
})
```

Scope Functions: `let, run, with, apply, also`

| Function | Object reference | Return value   | Is extension function                        |
| :------- | :--------------- | :------------- | :------------------------------------------- |
| `let`    | `it`             | Lambda result  | Yes                                          |
| `run`    | `this`           | Lambda result  | Yes                                          |
| `run`    | -                | Lambda result  | No: called without the context object        |
| `with`   | `this`           | Lambda result  | No: takes the context object as an argument. |
| `apply`  | `this`           | Context object | Yes                                          |
| `also`   | `it`             | Context object | Yes                                          |

non-local return. 

```kotlin
fun foo() {
    inlined_foo {
        return // OK: the lambda is inlined
    }
    ordinary_foo {
    	return // compile-fail
    }
}

fun foo() {
    run loop@{
        listOf(1, 2, 3, 4, 5).forEach {
            if (it == 3) return@loop // non-local return from the lambda passed to run
            print(it)
        }
    }
    print(" done with nested loop")
}

fun foo() {
    listOf(1, 2, 3, 4, 5).forEach {
        if (it == 3) return@forEach // local return to the caller of the lambda, i.e. the forEach loop
        print(it)
    }
    print(" done with implicit label")
}

// preferred. Don't use lambda
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach(fun(value: Int) {
        if (value == 3) return  // local return to the caller of the anonymous fun, i.e. the forEach loop
        print(value)
    })
    print(" done with anonymous function")
}

// forbit it with `crossinline` modifier
inline fun f(crossinline body: () -> Unit) {
    val f = object: Runnable {
        override fun run() = body()
    }
    // ...
}
```

## OOP

basic

```kotlin
enum class Protocol (private val protocol: String) {
    HTTP_1_0("http/1.0"),
    ...
}

// primary constructor
class Person [modifier] constructor(firstName: String) { /*...*/ }
class Person(firstName: String, secondName: String = "anonymous") { 
    init {}
    init {} // mutiple init blocks are executed in the same order as they appear
    
    // any secondary constructor
    constructor(i: Int) {}
}

// specify args name like Python
Person(firstName = "wck")

// By default, classes / methods / properties are final. use `open` modifier
open class Base(p: Int) {
    open val vertexCount: Int = 0
    open fun draw() { /*...*/ }
}

// Calling the outerclass / superclass implementation
super@FilledRectangle.draw()

// anonymous subclass / object
private val runnable: Runnable = object : Runnable {
  override fun run() { ... }
}
```

getter/setter

```kotlin
@get:JvmName("X")        // defalut name: get/setXX for Java
@set:JvmName("changeX")
var stringRepresentation: String
    get() = this.toString()
    set(value) {
        setDataFromString(value)
    }
```

java static members are replaced with [companion objects](https://kotlinlang.org/docs/reference/object-declarations.html#companion-objects), [top-level functions](https://kotlinlang.org/docs/reference/functions.html), [extension functions](https://kotlinlang.org/docs/reference/extensions.html#extension-functions), or [@JvmStatic](https://kotlinlang.org/docs/reference/java-to-kotlin-interop.html#static-methods).

```kotlin
class MyClass {
    // note that Factory is not static member
    companion object Factory {  // the name Factory can be omitted
        fun create(): MyClass = MyClass()
    }
}
val instance = MyClass.create()
val factory = MyClass.Companion
val factory2 = MyClass // the same as factory
```

singleton:

```kotlin
object DataProviderManager {
    fun registerDataProvider(provider: DataProvider) {
        // ...
    }
    val allDataProviders: Collection<DataProvider>
        get() = // ...
}

// or 
class X {
  companion object {
    @JvmField
    val INSTANCE = ...
  }
}
```

extension:

- resolved **statically**
- does not prioritize member function with the same receiver 

```kotlin
fun <T> MutableList<T>.swap(index1: Int, index2: Int) {
    val tmp = this[index1] // 'this' corresponds to the list
    this[index1] = this[index2]
    this[index2] = tmp
}

// nullable receiver
fun Any?.toString(): String {
    if (this == null) return "null"
    return toString()
}
```

redefine operator

```kotlin
/**
     * Constructs an interceptor for a lambda. This compact syntax is most useful for inline
     * interceptors.
     *
     * ```
     * val interceptor = Interceptor { chain: Interceptor.Chain ->
     *     chain.proceed(chain.request())
     * }
     * ```
     */
inline operator fun invoke(crossinline block: (chain: Chain) -> Response): Interceptor =
object : Interceptor {
    override fun intercept(chain: Chain) = block(chain)
}

// interceptors += BridgeInterceptor(client.cookieJar)
@kotlin.internal.InlineOnly
public inline operator fun <T> MutableCollection<in T>.plusAssign(element: T) {
    this.add(element)
}

// [i]
public operator fun get(index: Int): E
```

