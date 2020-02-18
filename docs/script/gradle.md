---
layout: default
title: Gradle in 30 Minutes
parent: Script
nav_order: 80
---

# Gradle in 30 Minutes
{: .no_toc }

## References
{: .no_toc .text-delta }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

- Gradle build = project + project + project
- project = task + task + task

## Variable

```gradle
String someString = 'mY_nAmE'
println "Original: $someString"
```

## Control

```gradle
4.times { print "$it " }
4.times { counter -> println "I'm task number $counter" }
```

## Task

```gradle
task taskX {
    dependsOn 'taskY'
    doLast {
        println 'taskX'
    }
}

taskX.doFirst {
    println 'Hello Venus'
}
taskX.configure {
    doLast {
        println 'Hello Mars'
    }
}
```

```gradle
4.times { counter ->
    task "task$counter" {
        doLast {
            println "I'm task number $counter"
        }
    }
}
```

