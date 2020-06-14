---
layout: default
title: Android
nav_order: 200
permalink: docs/android
has_children: true
---

# Android

Reference: 

- [Official Guide](https://developer.android.com/guide)

## System

Layer:

- Applications
- Application Framework (e.g. ActivityService, WiFiService)
- Native Layer (e.g., SSL, libc, Dalvik VM, openGL, SQLite)
- Linux Kernel

## Entry Points

multiple entry points / activities:

- activity: interact with the user
  - When one app invokes another, the calling app invokes an activity in the other app, rather than the app as an atomic whole. In this way, the activity serves as the entry point for an app's interaction with the user.
  - Typically, one activity in an app is specified as the *main activity*, which is the first screen to appear when the user launches the app. 
  - [Life Cycle](https://developer.android.com/guide/components/activities/activity-lifecycle)
- services: run in the background
  - If it is not something the user is directly aware as running, the system may kill the service. Foreground services must display a [Notification](https://developer.android.com/guide/topics/ui/notifiers/notifications.html).
  - We can bound a process to a server in another process. `bindService()`
  - The service does **not** create its own thread and does **not** run in a separate process unless you specify otherwise.
- broadcast receivers: e.g. alarm, low battery, ...
- Content provides

```java
Intent intent = new Intent(context, LogActivity.class);  // entry point 
intent.putExtra(key, value);  // and its argv (intent)
String value = intent.getStringExtra(key); // get argv
```

backgroud work:

- Long-running HTTP download: DownloadManager
- Deferrable work: ForegroundService
- Trigger by system events: WorkManager
- Run at precise time: Alarmmanager
- Generic: WorkManager

## Threads Modle

UI is handled by a *main thread* (sometimes called *Looper thread*). The Android UI toolkit is *not* thread-safe. So, you must not manipulate your UI from a worker thread—you must do all manipulation to your user interface from the UI thread (i.e. the main thread).

A thread may be associated with a `Looper`, which is a message queue and is often used with `Handler`.

Handler

- bound to the thread / message queue of the thread that is creating it. Therefore, other threads can communicate back with the main application thread through a Handler
- `post()` enqueue Runnable 
- `sendMessage()` processed by Handler's overridden method

Access the UI thread from other threads

- `Activity.runOnUiThread(Runnable)`
- `View.post(Runnable)`
- `Handler`
- `AsyncTask`: `onPreExecute()` -> `doInBackground(Params...)` -> `onProgressUpdate(Progress...)` -> `onPostExecute(Result)` (**deprecated in API level 30**)

