---
layout: default
title: IPC
parent: Android
nav_order: 60

---

# IPC
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

Reference: 

- [Deep Dive into Android IPC/Binder Framework at Android Builders Summit 2013](https://events.static.linuxfound.org/images/stories/slides/abs2013_gargentas.pdf)


## Binder

Motivation: 

- heavy overhead of traditional IPC
- DoS issue
- System V IPC is prone to kernel resource leakage

Solution Binder:

- An IPC/component system for developing objectoriented OS services.
- built-in reference-count + death-notification
- Message-based; not well for streaming
- Binder driver is exposed via `/dev/binder` and offers a relatively simple API based on open, release, poll, mmap, flush, and ioctl operations.

Model:

- Context Manager (a.k.a. `servicemanager`): A special Binder object with handle 0 that is used as a registry/loopup service for other Binders.
- The Binder transaction buffer has a limited fixed size, currently 1MB, which is shared by all transactions in progress for the process. This limit is at the process level rather than at the per activity level.

`IBinder`

- Do not implement this interface directly, instead extend from its subclass `Binder`. Most developers use Andorid Interface Definition Language (AIDL) to generate the appropriate Binder subclass.
- You must keep in mind the situations in which your process could go away
- synchronous: `transact(Parcel)` -> `onTransact(Parcel)` 

## Data Containers: Parcel and Bundle

`Parcel`

- container of messages 
- It is recommend that you do not use custom parcelables, because the system cannot unmarshal a class that it has no knowledge of.

`Bundle`

- map from key to `parceable`

`Message`:

- Contain a `bundle`

```java
Bundle data = new Bundle(1);
data.putParcelable("completed-uri", uri); 
message.setData(data); 
```

## AIDL

Each Binder-based service is defined in a separate `.aidl` file. The build tool will extract a real Java interface  (a Stud providing android.os.IBinder) to `gen/` directroy.

```java
package com.example.app;
import com.example.app.Bar;
interface IFooService {
  void save(inout Bar bar);
  Bar getById(int id);
  void delete(in Bar bar);
  List<Bar> getAll();
}
```

## Intent and ContentProvider

- a higher-level abstraction of Binder
- a framework for asynchronous communication among Android components
- Facilitated via system services: `ActivityManagerService` and `PackageManagerService`
- `Intent`
  - enables both point-to-point as well as publish-subscribe messaging domains
  - Implicit intents enable loosely-coupled APIs
- `ContentProvider`
  - ContentResolvers communicate synchronously with ContentProviders (typically running in separate apps) via a fixed (CRUD) API

```java
public class Caller extends Activity {
  private static final int SCAN_REQ = 0;
  public void onClick(View view) {
    // call who
    Intent intent = new Intent("com.example.android.SCAN");
    intent.setPackage("com.example.android");
    intent.putExtra(key, value);
    super.startActivityForResult(intent, SCAN_REQ);
  }
  
  @Override 
  protected void onActivityResult(int responseCode, int resultCode, Intent data) {
    // responseCode: SCAN_REQ
    // resultCode: RESULT_OK
    data.getStringExtra(key);
  }
}

public class Callee extends Activity {
  private void handleX(...) {
    Intent intent = new Intent(getIntent().getAction());
    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_WHEN_TASK_RESET);
    intent.putExtra(key, value);
    // ...
    super.setResult(Activity.RESULT_OK, intent);
    super.finish();
  }
}
```

## Messager and Handler

- All underlying communication is still based on Binder

```java
// caller
Intent intent = new Intent(...);
Messenger messenger = new Messenger(new ClientHandle(this));
intent.putExtra("callback-messenger", messenger);
super.startService(intent);

class ClientHandle extends Handler {
  private final WeakReference<DownloadClientActivity> clientRef;
  public ClientHandler(DownloadClientActivity client) {
    this.clientRef = new WeakReference<DownloadClientActivity>(client);
  }
  
  @Override
  public void handleMessage(Message msg) {   // receive the returned value
    Bundle data = msg.getData();
    DownloadClientActivity client = clientRef.get();
    if (client != null && data != null && msg.waht == CALLBACK_MSG) {
      ....
    }
  }
}

// callee
protected void onHandleIntent(Intent intent) {
  Messenger messenger = intent.getParcelableExtra("callback-messenger");
  Message message = Message.obtain();
  message.what = CALLBACK_MSG;
  Bundle data = new Bundle(1);
  data.putParcelable("completed-uri", uri); 
  message.setData(data); 
  try {
    messenger.send(message);   /// return Message
  } catch (RemoteException e) {
    // ....
  } finally {
    message.recycle(); 
  }
}

```

