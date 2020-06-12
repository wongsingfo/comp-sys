---
layout: default
title: Java in 30 Minutes
parent: Programming Language
nav_order: 30

---

# Java in 30 Minutes
{: .no_toc }

## References
{: .no_toc .text-delta }

- [Tutorials](https://docs.oracle.com/javase/tutorial/)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Component

- Byte code verifier 
  -  Assures that no user program can crash the host machine or interfere with other operations on the host machine
  - Protect certain methods and data structures belonging to trusted code from access or corruption by untrusted code executing within the same JVM
  - Prevent corruptions caused by programmer errors
 - JDK (Development Kit)
    - JRE (Runtime envrionment)
       - Java virtual machine
       - Java class library
    - Some tools
       - `javac, javadoc, jdb`

## Reflection

For every type of object, the Java virtual machine instantiates an immutable instance of `java.lang.Class`. It is the entry point for all of the Reflection APIs.

With the exception of [`java.lang.reflect.ReflectPermission`](https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/ReflectPermission.html), none of the classes in [`java.lang.reflect`](https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/package-summary.html) have public constructors. To get to these classes, it is necessary to invoke appropriate methods on [`Class`](https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html).

```java
Class c = "foo".getClass();

# If the type is available but there is no instance then it is possible to obtain a Class by appending ".class" to the name of the type.
boolean b;
Class c = b.getClass();   // compile-time error
Class c = boolean.class;  // correct

Class c = Class.forName("com.duke.MyLocaleServiceProvider");
```

### Type Signature

- Z: boolean
- B: byte
- C: char
- S: short
- I: int
- J: long
- F: float
- D: double
- `L fully-qualified-class ;`
- `[ type` : for array
- `( arg-types ) ret-type` : method type

```java
long f (int n, String s, int[] arr); 
(ILjava/lang/String;[I)J 

Object[3]
[Ljava.lang.Object;
```

## Java Verison 

- Java SE (Standard Edition) 8 (LTS)
- Java SE 11 (LTS)
- EE (Enterprise Edition): an extension for SE

MacOS:

```bash
/usr/libexec/java_home -V     # list all 
export JAVA_HOME=`/usr/libexec/java_home -v 1.8`  # use SE 8

# remove jdk:
sudo rm -rf /Library/Java/JavaVirtualMachines/jdk<version>.jdk
# remove plugin
sudo rm -rf /Library/PreferencePanes/JavaControlPanel.prefPane
sudo rm -rf /Library/Internet\ Plug-Ins/JavaAppletPlugin.plugin
sudo rm -rf /Library/LaunchAgents/com.oracle.java.Java-Updater.plist
sudo rm -rf /Library/PrivilegedHelperTools/com.oracle.java.JavaUpdateHelper
sudo rm -rf /Library/LaunchDaemons/com.oracle.java.Helper-Tool.plist
sudo rm -rf /Library/Preferences/com.oracle.java.Helper-Tool.plist
```

## Annotation

Annotations have no direct effect on the operation of the code they annotate. Annotations have a number of uses, among them:

- **Information for the compiler** — Annotations can be used by the compiler to detect errors or suppress warnings.
- **Compile-time and deployment-time processing** — Software tools can process annotation information to generate code, XML files, and so forth.
- **Runtime processing** — Some annotations are available to be examined at runtime.

```java
@Author(
   name = "Benjamin Franklin",
   date = "3/27/2003"
)
class MyClass() { ... }

// If there is just one element named value, then the name can be omitted:
@SuppressWarnings(value = "unchecked")
@SuppressWarnings("unchecked")
```

```java
// Define annotation type
public @interface ClassPreamble {
   String author();
   String date();
   int currentRevision() default 1;
   String lastModified() default "N/A";
   String lastModifiedBy() default "N/A";
   // Note use of array
   String[] reviewers();
}

// Use
@ClassPreamble (
   author = "John Doe",
   date = "3/17/2002",
   currentRevision = 6,
   lastModified = "4/12/2004",
   lastModifiedBy = "Jane Doe",
   // Note array notation
   reviewers = {"Alice", "Bob", "Cindy"}
)

// TO make the information in @ClassPreamble appear in Javadoc-generated documentation:
import java.lang.annotation.*; // import this to use @Documented
@Documented
@interface ClassPreamble {
   // Annotation element definitions
}
```

```java
// Repeatable Annotation Type
import java.lang.annotation.Repeatable;

@Repeatable(Schedules.class)
public @interface Schedule {
  String dayOfMonth() default "first";
  String dayOfWeek() default "Mon";
  int hour() default 12;
}
public @interface Schedules {
    Schedule[] value();
}

@Schedule(dayOfMonth="last")
@Schedule(dayOfWeek="Fri", hour="23")
public void doPeriodicCleanup() { ... }
```

Common practice:

```java
public interface House { 
    /**
     * @deprecated use of open 
     * is discouraged, use
     * openFrontDoor or 
     * openBackDoor instead.
     */
    @Deprecated
    public void open(); 
    public void openFrontDoor();
    public void openBackDoor();
}
public class MyHouse implements House { 
    @SuppressWarnings("deprecation")
    public void open() {} 
    public void openFrontDoor() {}
    public void openBackDoor() {}
}
```

