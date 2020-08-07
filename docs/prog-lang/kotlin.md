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

// don't generate getter/sette
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

## OOP

basic

```kotlin
enum class Protocol (private val protocol: String) {
    HTTP_1_0("http/1.0"),
    ...
}

// primary constructor
class Person [modifier] constructor(firstName: String) { /*...*/ }
class Person(firstName: String) { 
    init {}
    init {} // mutiple init blocks are executed in the same order as they appear
    
    // any secondary constructor
    constructor(i: Int) {}
}

// By default, classes / methods / properties are final. use `open` modifier
open class Base(p: Int) {
    open val vertexCount: Int = 0
    open fun draw() { /*...*/ }
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

