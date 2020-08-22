---
layout: default
title: Toolchain
parent: Android
nav_order: 50

---

# Toolchain
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

A full-fledged IDE like Android Studio is strongly recommended, but here we are not going to use any **heavy** IDE in order to understand how the whole toolchain works. In the past, there was no functionality in Android Studio that was not present in IntelliJ IDEA with the Android plugin installed. However, since its inception, Android Studio has grown and has diverged more and more from IntelliJ IDEA, especially recently [[ref](https://stackoverflow.com/questions/30779596/difference-between-android-studio-and-intellij-idea-with-plugins)].

Only java 8 (version 1.8) works compatibly with Andoird. 

## Setup

First, [download](https://developer.android.com/studio#command-tools) the `sdkmanger` which is a package manager. Unzip the file to `${ANDROID_HOME}/cmdline-tools/` (see [this post](https://stackoverflow.com/questions/60440509/android-command-line-tools-sdkmanager-always-shows-warning-could-not-create-se) for the details). Then to install your favourite command line tools (see [Andoird User Guide](https://developer.android.com/studio/command-line)), type the following commands ([sdkmanager Documentation](https://developer.android.com/studio/command-line/sdkmanager)): 

```bash
export ANDROID_HOME="${HOME}/android-home"
export PATH=$PATH:${ANDROID_HOME}/cmdline-tools/tools/bin:${ANDROID_HOME}/platform-tools
yes | sdkmanager "platform-tools" "ndk;21.3.6528147"
```

Useful tools:

```bash
cmdline-tools/tools/bin/sdkmanager

platform-tools/adb wait-for-device

platform-tools/adb [-d |-e | -s serial_number] do_somthing
# -s     select  (or use ANDROID_SERIAL env var)
# -e     use emulator
# -d     use hardware device
platform-tools/adb shell shell_command
platform-tools/adb devices
platform-tools/adb install app.apk

platform-tools/adb logcat  # Verbose, Debug, Info, Warning, Error, Fatal, Slient
platform-tools/adb logcat ActivityManager:I MyApp:D *:S
export ANDROID_LOG_TAGS="ActivityManager:I MyApp:D *:S"

# put /system partition in writable mode
platform-tools/adb remount
platform-tools/adb shell mount -o rw,remount,rw /system

# a common bug: NoClassDefFoundError: javax/xml/bind/annotation/XmlSchema
# try to use Java SE 8
tools/bin/avdmanager

tools/emulator -list-avds
tools/emulator @avd_name [ {-option [value]} … ]

# forward host_port device_port
# reverse device_port host_port
platform-tools/adb forward tcp:5039 tcp:5039
platform-tools/adb forward --remove tcp:8080
platform-tools/adb forward --remove-all

# package manager
platform-tools/adb shell pm list packages

# activity manager
# https://developer.android.com/studio/command-line/adb#IntentSpec
platform-tools/adb shell am start -a com.genymobile.gnirehtet.START \
    -n com.genymobile.gnirehtet/.GnirehtetActivity
    
# sysdump
adb shell dumpsys -l # a complete list of system services
adb shell dumpsys <service-name>
adb shell dumpsys <service-name> -c # machine-friendly format
adb shell dumpsys <service-name> -h # human-friendly format
```

## Build Process

Reference: [Android: Configure your build](https://developer.android.com/studio/build)

1. 
   - source code + resouce files + [ALDI file](https://developer.android.com/guide/components/aidl) (marshal data for IPC)
   - library modules + AAR library (Android Archive) + jar library  [see](https://developer.android.com/studio/projects/android-library)
2. DEX files (Dalvik Executable)
3. debug or release keystore  ([how to sign](https://developer.android.com/studio/build/building-cmdline#sign_cmdline))
4. APK file

```bash
./gradlew assembleDebug
# output: project_name/module_name/build/outputs/apk/
```

## Gradle

Android Studio uses [Gradle](http://www.gradle.org/), an advanced build toolkit, to automate and manage the build process. Gradle and the Android plugin run independent of Android Studio. 

Android uses the [gradle wrapper](https://docs.gradle.org/current/userguide/gradle_wrapper.html). It's available as a batch file for Windows (`gradlew.bat`) and a shell script for Linux and Mac (`gradlew`). To see all build targets, use `./gradlew tasks`. The gradle binary file is at `$HOME/.gradle/wrapper`.

A common bug: grade does not work with Java JDK 14 EA. [github issue](https://github.com/gradle/gradle/issues/10248). To fix it, use a newer version of Gradle. If you use Gradle Wrapper then refer to `$PROJECT_ROOT/gradle/wrapper/gradle-wrapper.properties`. Property distributionUrl should be: `distributionUrl=https\://services.gradle.org/distributions/gradle-6.3-bin.zip`

## Run on Hardware Device

```bash
adb devices
```

## Debug

Reference:

- https://source.android.com/devices/tech/debug

### GDB

```bash
push $ANDROID_HOME/prebuilt/android-arm/gdbserver /data
gdbserver :5039 ./a.out
adb forward tcp:5039 tcp:5039
(gdb) target remote :5039
```

### JDB

Dalvik VM adheres to the [Java Debug Wire Protocol (JDWP)](https://docs.oracle.com/javase/1.5.0/docs/guide/jpda/jdwp-spec.html)

```bash
platform-tools/am set-debug-app -w com.google.android.exoplayer2.demo
platform-tools/adb jdwp # list the debuggable processes

# (Where XXX is the PID of the debugged process.)
platform-tools/adb forward tcp:7777 jdwp:XXX  

jdb -sourcepath /your/project/src -attach localhost:7777
```

## Reverse Engineering

Tools:

- `apktool`: uncompress `apk` files
- `dex2jar`
- `jd_gui`: view java codes in the jar

