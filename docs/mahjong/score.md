---
layout: default
title: 分值计算
parent: Mahjong
nav_order: 5
mahjong: true
---

# 分值计算
{: .no_toc }

References: https://www.bilibili.com/read/cv4133506

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## 符数

七对子：固定25符，忽略下面

- 基础符数：20
- 役牌雀头：2（如果是连风雀头，翻倍）
- 明刻：2，暗刻：4，明杠：8，暗杠：16 （如果牌是幺九，翻倍）
- 一面听：2
- 门清：10
- 自摸：2

符数向上十位取整

## 点数

- 13番，32000，累计役满
- 11番，24000，三倍满
- 8番，16000，倍满
- 6番，12000，跳满
- let rv = 符数 x 2 ^ (2 + 番数)
- if rv > 2000，8000 满贯
- rv * 4

点数向上百位取整

亲家和牌 1.5 倍点数 

第 n 场连庄，需要多支付 300n




