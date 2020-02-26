---
layout: default
title: DNS
nav_order: 80
parent: Network Stack
---


# DNS
{: .no_toc }

on port 53.

References:

- [DNS Enumeration Tutorial - Dig, Nslookup & Host](https://www.youtube.com/watch?v=rQ-dc5kwRtU)
- [intodns](https://intodns.com/)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Structure

- Each domain has at least one authoritative DNS. 
- A DNS zone is any distinct, contiguous portion of the domain name space in the Domain Name System (DNS) for which administrative responsibility has been delegated to a single manager.
- Every DNS zone must be assigned a set of authoritative name servers. This set of servers is stored in the parent domain zone with name server (NS) records.
- name server: The Domain Name System is maintained by a distributed database system, which uses the client–server model. The nodes of this database are the _name servers_. DNS is a hierarchy of name servers.
  - Authoritative name server: only gives answers to DNS queries from data that has been configured by an original source, in contrast to answers obtained via a query to another name server that only maintains a cache of data. 
  - An authoritative name server can either be a primary server (master) or a secondary server (slave). A secondary server for a zone uses an automatic updating mechanism (DNS zone transfers, file transfer protocols, etc.) to maintain an identical copy of the primary server's database for a zone. The primary authoritative name server is identified by start-of-authority (SOA) resource record.

## Resouce Record (RR)

- ANY: all RRs
- A: IP address
- AAAA: IPv6 address
- CNAME: cannonical name for a alias
- MX: mail exchanger
- PTR: used in reverse lookup (`208.80.152.2` -> `2.152.80.208.in-addr.arpa`)
- NS: name server for the name zone
- SOA: the start of the authority for a name zone
- AXFR: used for DNS zone transfer

## Tools

dig @server name type
{{ site.bin_option_style }}

Use `+short` for automated tools.

```
$ dig @8.8.8.8 mail.google.com mx

; <<>> DiG 9.10.6 <<>> @8.8.8.8 mail.google.com mx
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 12170
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 512
;; QUESTION SECTION:
;mail.google.com.		IN	MX

;; ANSWER SECTION:
mail.google.com.	562948	IN	CNAME	googlemail.l.google.com.

;; AUTHORITY SECTION:
l.google.com.		60	IN	SOA	ns1.google.com. dns-admin.google.com. 295695647 900 900 1800 60

;; Query time: 34 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)
;; WHEN: Wed Feb 19 11:37:45 CST 2020
;; MSG SIZE  rcvd: 121
```

The SOA record includes the following details (as an example, `ns1.google.com. dns-admin.google.com. 295695647 900 900 1800 60`):

- The primary name server for the domain,
- Email address of the administrator responsible for this zone. 
- A timestamp that changes whenever you update your domain.
- The number of seconds before the zone should be refreshed.
- The number of seconds before a failed refresh should be retried.
- The upper limit in seconds before a zone is considered no longer authoritative.
- The negative result TTL (for example, how long a resolver should consider a negative result for a subdomain to be valid before retrying).

host -t type name
{{ site.bin_option_style }}

```
google.com has address 93.46.8.90
google.com has IPv6 address 2404:6800:4008:802::200e
google.com mail is handled by 50 alt4.aspmx.l.google.com.
google.com mail is handled by 20 alt1.aspmx.l.google.com.
google.com mail is handled by 30 alt2.aspmx.l.google.com.
google.com mail is handled by 10 aspmx.l.google.com.
google.com mail is handled by 40 alt3.aspmx.l.google.com.
```

nslookup name
{{ site.bin_option_style }}

`nslookup` also has an interactive interface:

```
> set type=mx
> google.com
Server:		116.116.116.116
Address:	116.116.116.116#53

Non-authoritative answer:
google.com	mail exchanger = 40 alt3.aspmx.l.google.com.
google.com	mail exchanger = 10 aspmx.l.google.com.
google.com	mail exchanger = 50 alt4.aspmx.l.google.com.
google.com	mail exchanger = 30 alt2.aspmx.l.google.com.
google.com	mail exchanger = 20 alt1.aspmx.l.google.com.

Authoritative answers can be found from:
```



