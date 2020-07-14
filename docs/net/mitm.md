---
layout: default
title: MITM
parent: Network Stack
nav_order: 10
---

# MITM

References:

- [mitmproxy](https://docs.mitmproxy.org/stable/concepts-howmitmproxyworks/)
  - note that mitmproxy and mitmweb save the content in the memory, while mitmdump save them to the disk.

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Explicit HTTP Proxy

- supported by system HTTP proxy. Unfortunately, some applications ignore the system HTTP proxy settings - Android applications are a common example. 

```
GET http://example.com/index.html HTTP/1.1  # HTTP
CONNECT 10.1.1.1:443 HTTP/1.1               # HTTPS
```

HTTPS MITM:

1. client sends `CONNECT` request
2. proxy returns 200
3. client sends SSL handshake with SNI
4. proxy sends SSL handshake with SNI
5. Server replies CN & SANs of the certificate
6. proxy fakes a certificate and completes handshake with cilent

## Transparent Proxy

- use [iptables](http://www.netfilter.org/) on Linux or [pf](https://en.wikipedia.org/wiki/PF_(firewall)) on OSX to redirect the connection. The routing mechanism will keep the original destination. 
- to distinguish HTTP and HTTPS connection, we can use automatic TLS detection, which works for SSLv3, TLS 1.0, TLS 1.1, and TLS 1.2 by look for a ClientHello message.

common configurations:

- custom gateway
  - Configure the client to use the proxy machine’s IP as the default gateway.
  - Setting the custom gateway on clients can be automated by serving the settings out to clients over DHCP. This lets set up an interception network where all clients are proxied automatically.
- custom Routing

## About Android

- Before Android 4.0, there was a single read-only file `/system/etc/security/cacerts.bks` containing the trust store with all the CA ('system') certificates trusted by default on Android

- Starting from Android 4.0, system trusted certificates are on the (read-only) system partition in the folder `/system/etc/security/` as individual files. However, users can now easily add their own 'user' certificates which will be stored in `/data/misc/keychain/certs-added`.

- [Since Android 7.0 Nougat](https://android-developers.googleblog.com/2016/07/changes-to-trusted-certificate.html), Apps that target API Level 24 and above no longer trust user or admin-added CAs for secure connections, by default. To see the traffic in debug mode, add `<application android:networkSecurityConfig=”@xml/network_security_config">` to the manifest and add these lines to `res/xml/network_security_config.xml`

  ```xml
  <network-security-config>  
        <base-config>  
              <trust-anchors>  
                  <!-- Trust preinstalled CAs -->  
                  <certificates src="system" />  
                  <!-- Additionally trust user added CAs -->  
                  <certificates src="user" />  
             </trust-anchors>  
        </base-config>  
   </network-security-config>
  ```

### Install System Certificate

[reference](http://wiki.cacert.org/FAQ/ImportRootCert#Android_Phones_.26_Tablets)

1. compute the hash using `openssl x509 -subject_hash_old -in <Certificate_File>`. 
2. rename the file as `[hash_result].0`
3. make `/system` writable
  ```
adb root
adb disable-verity
adb reboot
adb remount
adb shell
mount -o rw,remount /system
chmod 644 hash.0
  ```
4. Copy the file to `/system/etc/security/cacerts/`

## Certificate Pinning

also known as HTTP Public Key Pinning (HPKP). It's a a now-deprecated Internet security mechanism delivered via an HTTP header. Server uses it to deliver to the client (e.g. web browser) a set of hashes of public keys which must appear in the certificate chain of future connections to the same domain name.

**Certificate Pinning** was where you ignore that whole thing, and say trust *this certificate only* or perhaps trust only certificates *signed by this certificate*, ignoring all the other root CAs that could otherwise be trust anchors. It was frequently also known as **Key Pinning**, since it was actually the public key hash that got saved.

If you want to intercept the pinned connections, you need to patch the application manually. For Android and (jailbroken) iOS devices, various tools exist to accomplish this. For example, [JustTrustMe](https://github.com/Fuzion24/JustTrustMe), [Android-SSL-TrustKiller](https://github.com/iSECPartners/Android-SSL-TrustKiller)

