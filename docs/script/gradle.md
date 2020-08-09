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

##  Basic

- Gradle build = project + project + project
- project = task + task + task

```gradle
# Variable
String someString = 'mY_nAmE'
println "Original: $someString"

# flow control
4.times { print "$it " }
4.times { counter -> println "I'm task number $counter" }

# task
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

4.times { counter ->
    task "task$counter" {
        doLast {
            println "I'm task number $counter"
        }
    }
}
```

## Gradle in Android 

[documentation](https://developer.android.com/studio/build/index.html#top-level)

Top-level build:

```gradle
buildscript {
    // Gradle pre-configures support for remote repositories 
    // such as JCenter, Maven Central, and Ivy
    repositories {
        // google()
        // jcenter()
        // set up mirror source
        maven{ url 'http://maven.aliyun.com/nexus/content/groups/public/' }
        maven{ url 'http://maven.aliyun.com/nexus/content/repositories/jcenter'}
    }
		// adds Android plugin for Gradle version 4.0.0
    dependencies {
        classpath 'com.android.tools.build:gradle:4.0.0'
    }
}

// you should configure module-specific dependencies in each module-level file
allprojects {
   repositories {
       // google()
       // jcenter()
       // set up mirror source
       maven{ url 'http://maven.aliyun.com/nexus/content/groups/public/'}
       maven{ url 'http://maven.aliyun.com/nexus/content/repositories/jcenter'}
   }
}

// properties
ext {
	compileSdkVersion = 28
}
```

Module build:

```gradle
android {
  buildTypes {
    release {
      .. 
    }
  }
  // access project properties
  compileSdkVersion rootProject.ext.compileSdkVersion
  
  // JNI
  externalNativeBuild {
    cmake {
      path 'CMakeLists.txt'
    }
  }
}
dependencies {
  // access project properties
  implementation "com.android.support:appcompat-v7:${rootProject.ext.supportLibVersion}"
  implementation fileTree(dir: 'libs', include: ['*.jar'])
  testImplementation
}
```

