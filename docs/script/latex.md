---
layout: default
title: Latex in 30 Minutes
parent: Script
nav_order: 30
---

{% raw %}

# Latex Script in 30 Minutes
{: .no_toc }

## References
{: .no_toc .text-delta }

- [Installation: latex project](https://www.latex-project.org)
- [Detexify](http://detexify.kirelabs.org/classify.html)
- [Wiki](https://en.wikibooks.org/wiki/LaTeX)
- [Setup Overleaf](https://github.com/overleaf/overleaf/wiki/Quick-Start-Guide) ([tsinghua mirror](https://mirror.tuna.tsinghua.edu.cn/help/CTAN/))

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Basic Structure

```latex
\begin{itemize}
\item A
\item B
\end{itemize}
```

## Math

```latex
\usepackage{mathtools}  %%  fixes some amsmath quirks
\usepackage{xfrac}      %%  provides \sfrac command to create slanted fractions
```

- math: `$....$`: In-line math. If it is overflow, try to add `\sloppy` at the beginning of the paragraph.
- displaymath `\[ ....\]`: Equations with no label
- equation `\begin{equation} \end{equation}`: Equations with label

- `\\`: a line break and within the correct math mode environment
- `&`: horizontal alignment
- `\qquad`, `\quad`, `\,`, `\:`, `\;`: spacing
- `\!`: negative spacing 

- `P\left(A=2\middle|\frac{A^2}{B}>4\right)`: Automatic sizing
- `( \big( \Big( \bigg( \Bigg(`: Manual sizing

```latex
\begin{align*}
    \badnat & ::=  \desc{non-numeric normal form} \\
        & \wrong  \desc{run-time error} \\
        & \true  \desc{constant true} \\
        & \false  \desc{constant false} \\
    \badbool & ::=  \desc{non-boolean normal form} \\
        & \wrong  \desc{run-time error} \\
        & \nv  \desc{numeric value} \\
\end{align*}
```

## Macro

```latex
\newcommand{\name}[num]{definition}

\newcommand{\myvec}[1] {\vec{#1}}
\newcommand{\foldop}   {\kw{fold}}
\newcommand{\fmap}[2]  {\OpABTp{\fmapop}{#1}{#2}}

\fmap{a}{b}
```

```latex
\newcommand\makekw[1]{%
\expandafter\newcommand\csname #1\endcsname{ \kw{#1} }}
```

```latex
\newenvironment{name}[num][default]{before}{after}

\newenvironment{correct}%
{\noindent\ignorespaces}%
{\par\noindent%
\ignorespacesafterend}

\begin{correct}
No space\\to the left.
\end{correct}
Same\\here.
```

nested (used `##` for the inner macro):

```latex
\newenvironment{topics}{
\newcommand{\topic}[2]{ \item{##1 / ##2} }
Topics:
\begin{itemize}
}
{
\end{itemize}
}
```

## Reference

```latex
%% https://tex.stackexchange.com/questions/301320/cite-a-theorem-by-its-name-and-number
\makeatletter
\@ifpackageloaded{hyperref}%
  {\newcommand{\mylabel}[2]% #1=name, #2 = contents
    {\protected@write\@auxout{}{\string\newlabel{#1}{{#2}{\thepage}%
      {\@currentlabelname}{\@currentHref}{}}}}}%
  {\newcommand{\mylabel}[2]% #1=name, #2 = contents
    {\protected@write\@auxout{}{\string\newlabel{#1}{{#2}{\thepage}}}}}
\makeatother

\begin{lemma}
\mylabel{lemma:adequacy}{Lemma \thelemma}
    If $\oparroww{\termg}{\termt}$ and $\termt$ contains the $\wrong$ subterm, then $\termg$ is stuck in the original semantics.
\end{lemma}

And by \ref{lemma:adequacy}, we can easily show the ``if" half.
```



{% endraw %}

