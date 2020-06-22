---
layout: default
title: WireShark
parent: Network Stack
nav_order: 80
---

# WireShark

References:

- [Documentation](https://www.wireshark.org/docs/)
- [Manual](https://www.wireshark.org/docs/man-pages/)
- Youtube: [How to Troubleshoot Throughtput and TCP Windows](https://www.youtube.com/watch?v=qFWjugyKyrE)
- Youtube: [Wireshark CLI tools & scripting](https://www.youtube.com/watch?v=IZ439VNvJqo)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

CLI tools:

- tshark: CLI version of Wireshark
  - similar to tcpdump, but stateful
- dumpcap
  - capture engine, stateless
  - ring buffer feature `dumpcap -i 5 -s0 -b filesize:16384 -files:1024 -w ring.cap`
- capinfos
- editcap
  - select frame ranges or time ranges
    - `editcap -r example.cap tmp.cap 1-1000 2001-3000`
    - `editcap -A "2018-01-17 11:40:00" -B "2018-01-17 11:40:59" example.cap tmp.cap`
  - split in chunks
    - `-c 1000`
    - `-i 10`
  - change snaplen `-s`
  - change timestamp `-t offset`
  - change format `editcap -F pcap player_online.pcapng player_online.pcap`
- mergecap

## Best Practice

```absh
Demo 1:
===========
tshark -r http.pcap 
tshark -r http.pcap -V           # verbose
tshark -r http.pcap -V -O http   # only show http layer 
tshark -r http.pcap -T pdml      # output format (text,json,pdml)
tshark -r http.pcap | wc
tshark -r http.pcap -V | wc
tshark -r http.pcap -T pdml | wc
ls -l http.pcap

Demo 2:
===========
tshark -r port-1234.pcap 
tshark -r port-1234.pcap -x  # add output of hex and ASCII dump
tshark -r port-1234.pcap -d tcp.port==1234,http -Y http  # display filter

Demo 3:
===========
tshark -r ssl.pcap
tshark -r ssl.pcap -o ssl.keys_list:192.168.3.3,443,http,key.pem
tshark -r ssl.pcap -o ssl.keys_list:192.168.3.3,443,http,key.pem -Y http.response -V -O http | more

Demo 4:
===========
tshark -r http.pcap -o tcp.desegment_tcp_streams:TRUE -Y http
tshark -r http.pcap -o tcp.desegment_tcp_streams:FALSE -Y http
tshark -r http.pcap -o tcp.desegment_tcp_streams:TRUE -Y http -w true.pcap
tshark -r http.pcap -o tcp.desegment_tcp_streams:FALSE -Y http -w false.pcap
tshark -r true.pcap
tshark -r false.pcap

Demo 5:   # Protocol Statistics
===========
tshark -r mail.pcap -qz io,phs
tshark -r mail.pcap -qz conv,ip
tshark -r mail.pcap -qz conv,tcp
tshark -r mail.pcap -qz io,stat,60,ip,tcp,smtp,pop

Demo 6:
===========
editcap -i 60 mail.pcap tmp.pcap
ls -l tmp*.pcap
capinfos -Tcae tmp*
rm tmp*
editcap -c 1000 mail.pcap tmp.pcap
ls -l tmp*.pcap
capinfos -Tcae tmp*
mergecap -w mail-new.pcap tmp*
cmp mail-new.pcap mail.pcap 

Demo 7:
===========
tshark -r mail.pcap -c1 -V -O frame
editcap -t -27.681538 mail.pcap mail-new.pcap
tshark -r mail-new.pcap -ta | more
tshark -r mail-new.pcap -ta | tail -1
capinfos -Teacu mail*
```

```
Example 1:  # counting http response code
==========
tshark -r example.pcap -Y http.response | head
tshark -r example.pcap -Y http.response -T fields -e http.response.code  | head
tshark -r example.pcap -Y http.response -T fields -e http.response.code  | sort | uniq -c

Example 2:  # top 10 request url
==========
tshark -r example.pcap -Y http.request -T fields -e http.host -e http.request.uri | head -20
tshark -r example.pcap -Y http.request -T fields -e http.host -e http.request.uri | head -20 | sed -e 's/?.*$//'   # strip everything after "?"
tshark -r example.pcap -Y http.request -T fields -e http.host -e http.request.uri | head -20 | sed -e 's/?.*$//' | sed -e 's#^\(.*\)\t\(.*\)$#http://\1\2#'
tshark -r example.pcap -Y http.request -T fields -e http.host -e http.request.uri | sed -e 's/?.*$//' | sed -e 's#^\(.*\)\t\(.*\)$#http://\1\2#' | sort | uniq -c
tshark -r example.pcap -Y http.request -T fields -e http.host -e http.request.uri | sed -e 's/?.*$//' | sed -e 's#^\(.*\)\t\(.*\)$#http://\1\2#' | sort | uniq -c | sort -rn | head

Example 3:  # find out session with spcific cookie
==========
tshark -r example.pcap -Y "http.request and http.cookie contains \"PHPSESSID=c0bb9d04cebbc765bc9bc366f663fcaf\"" | head
# the stream numbers
tshark -r example.pcap -Y "http.request and http.cookie contains \"PHPSESSID=c0bb9d04cebbc765bc9bc366f663fcaf\"" -T fields -e tcp.stream | head  
tshark -r example.pcap -Y "http.request and http.cookie contains 
# stream number filter (tcp.stream==1||tcp.stream==23||tcp.stream==31)
\"PHPSESSID=c0bb9d04cebbc765bc9bc366f663fcaf\"" -T fields -e tcp.stream | awk '{printf("%stcp.stream==%s",sep,$1);sep="||"}'
tshark -r example.pcap -w cookie.pcap -Y `tshark -r example.pcap -Y "http.request and http.cookie contains \"PHPSESSID=c0bb9d04cebbc765bc9bc366f663fcaf\"" -T fields -e tcp.stream | awk '{printf("%stcp.stream==%s",sep,$1);sep="||"}'`
capinfos -Teac example.pcap cookie.pcap 

Example 4:  # all sessions for a user
==========
tshark -r example.pcap -Y "http.request and http contains sake-test1" -T fields -e http.cookie
for cookie in `tshark -r example.pcap -Y "http.request and http contains sake-test1" -T fields -e http.cookie`; do   echo $cookie; done
for cookie in `tshark -r example.pcap -Y "http.request and http contains sake-test1" -T fields -e http.cookie | cut -d ' ' -f2`; do   echo $cookie; done
for cookie in `tshark -r example.pcap -Y "http.request and http contains sake-test1" -T fields -e http.cookie | cut -d ' ' -f2`; do    tmpfile="tmp_`echo $cookie | cut -d '=' -f 2`.pcap";    echo "Processing session cookie $cookie to $tmpfile"; done

Example 5:  # show metrics per URI
==========
tshark  -r example.pcap -Y http.request -T fields -E separator=' ' -e frame.number -e http.request.uri | sed -e 's/\?.*$//' > req
tshark -r example.pcap -Y http.response -T fields -E separator=' ' -e http.request_in -e http.response.code -e http.time > resp
q 'SELECT REQ.c2, count(*), min(RESP.c3), avg(RESP.c3), max (RESP.c3) FROM req AS REQ JOIN resp AS RESP ON REQ.c1=RESP.c1 GROUP BY REQ.c2'  # q is a SQL engine used for text data
```

## [Lua](https://wiki.wireshark.org/Lua)

Lua can be used to write 

- dissectors
- post-dissectors 
- taps (Taps are a mechanism to fetch data from every frame. They can be defined to use a display filter.)

