---
layout: default
title: Memory
parent: Computer System
nav_order: 50
mathjax: false
---

# Memory
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC

{:toc}

## Allocating

kmalloc(), kzalloc(), kmalloc_array(), kcalloc(), vmalloc(), and vzalloc()

```c
p = kmalloc(sizeof(*p), ...);
p = kmalloc_array(n, sizeof(...), ...);
p = kcalloc(n, sizeof(...), ...);   // zeroed array
```

```c
#define ARRAY_SIZE(x) (sizeof(x) / sizeof((x)[0]))
#define FIELD_SIZEOF(t, f) (sizeof(((t*)0)->f))
```

