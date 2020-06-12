---
layout: default
title: JDB in 30 Minutes
parent: Script
nav_order: 10
---

# JDB in 30 Minutes
{: .no_toc }

## References
{: .no_toc .text-delta }



## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}





Add these options to start the jvm

```
-Xdebug, -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=9009
```

