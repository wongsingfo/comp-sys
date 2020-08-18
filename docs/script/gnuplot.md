---
layout: default
title: Gnuplot in 30 Minutes
parent: Script
nav_order: 10
---

# Gnuplot in 30 Minutes
{: .no_toc }

## References
{: .no_toc .text-delta }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Overview

```
plot 'file1' [options], 'file2' [options]
replot

set multiplot layout 2,2
...
unset multiplot
     
using (1.23):3:5:(2.3)
using 1:2:(sqrt($3))
using 1:($2/25.4)      # mm -> inch

with points
with linespoints
with lines
with filledcurves

# use `test` to preview
linestyle
linetype
lw 2        # linewidth
lc -1       # linecolor
lc rgbcolor "#2B60DE"
lc rgb "orange−red"  # purple
pt 19       # pointtype
ps 3        # pointsize

t  "type1"  # title

axis x1y1   # see section axes for more details
axis x1y2

index 1     # only use data in the first block

# combine the following two commands to enable automatic updates
pause 1
reread
```

## style

```
set style fill transparent solid 0.4       # 0.4 is alpha value
set style fill transparent solid 0.4 noborder
set style fill transparent pattern 1 border
set style fill solid 0.4 border
```

## axes

```
set samples 500

set title "My first graph"
set xlabel "Deflection (meters)"
set ylabel "Force (kN)"
set xrange [−2∗pi:2∗pi]
set autoscale
set xtics ('0' 0, '90' pi/2, '-90' -pi/2, '45' pi/4,'-45' -pi/4,'135' 3*pi/4,'-135' -3*pi/4)
set xtic auto
set xtics 1,1,12
set ytics −1,0.5,1
set ytics 0.5

set grid
unset grid
```

### two y axes

```
set ylabel "降水量(毫米)"
set y2label "气温(摄氏度)"
set ytics nomirror
set y2tics
```

### log

```
set logscale y
set logscale xy
unset logscale      # reset
```

## string

```
four = "4"
graph4 = "Title for plot #4"
graph(n) = sprintf("Title for plot #%d",n)
N=4

plot ’data.4’ title "Title for plot #4" 
plot ’data.4’ title graph4
plot ’data.4’ title "Title for plot #".four 
plot ’data.4’ title graph(4)
plot ’data.’.N title "Title for plot #".N
```

```
style1 = "lines lt 4 lw 2"
style2 = "points lt 3 pt 5 ps 2"
range1 = "using 1:3"
range2 = "using 1:5"
plot "foo" @range1 with @style1, "bar" @range2 with @style2
```

```
set label "generated on ‘date +%Y-%m-%d‘ by ‘whoami‘" at 1,1
```

```
set format y "%.0e"  # 指数格式
set format y "%.5f"
set format y "%g"    # 根据长度自动选择 %f 或者 %e
```

## coordinate

- default
- second
- graph: 0-1
- screen: 0-1
- character

## data file

```
### comment
1 2
2 5
1 7
```

## save to file

```
set terminal postscript eps color solid linewidth 2 "Helvetica" 20
#  color 参数表示我们要彩色图，solid 表示我们要实线不要虚线，linewidth 参数指定 2 倍线宽，而最后指定使用 Helvetica 20 号字体
set output "precipitation.eps"
```

```
set term pdfcairo lw 2 font "Times_New_Roman,8"
set output "precipitation.pdf"
```

```
set term pngcairo lw 2 font "AR_PL_UKai_CN,14"
set terminal png transparent enhanced font "arial,10" fontscale 1.0 size 600, 400 
set output "precipitation.png"
```

reset:

```
set output
set term wxt
```

