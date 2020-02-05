---
layout: default
title: Ext2
parent: Computer System
nav_order: 20
---

# Ext2 Filesystem
{: .no_toc }

Second Extended Filesystem

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}


history:

- MINIX filesystem
- Extended filesystem, when Linux matured
- Ext2, 1994
- Ext3, widely used

features:

- may choose the block size (1024 ~ 4096 bytes)
- may choose the number of inodes for a partition of a given size
- disk block are partitioned into groups. Each group includes data blocks and inodes stored in adjacent tracks.
- preallocates disk data blocks for regular files
- support fast symbolic links
- consistency check by `e2fsck`

Ext2 **does not** support journalling.




