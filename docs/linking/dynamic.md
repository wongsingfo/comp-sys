---
layout: default
title: Dynamic Linking
parent: Linking
nav_order: 20
---

# Dynamic Linking and Library
{: .no_toc }

References:

- The Linux Programming Interface Ch41 & 42


## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Overview

- DONNOT use static shared library. A module is always mapped to a specific address.
- *Symbol relocation* must be performed at run time. 
  - `-shared` option: `.text` section can not be shared by two or more processes
  - `-shared -fPIC` options: can be shared because it generate position-independent code
- ELF supersedes the older a.out and COFF formats

ldd
{{ site.bin_option_style }}

List the shared library the program or the library needs.

LD_DEBUG=help command
{{ site.bin_option_style }}

Environment variables. Monitoring the Dynamic Linker.

## PIC

- inner call (static function): relative jmp (i.e., relative to `pc` register)
- inner data: relative to `pc` register
- inter-module data: GOT (global offset table)
  - GOT address can be obtained the same way as inner data
  - GOT save the address of inter-module data
  - GOT is filled by ld.so
  - global variable defined locally should also be treated as inter-module data. In this case, ld need to do more things.
- inter-module call: the same way as inter-module data 

-fPIC
{{ site.bin_option_style }}

`-fPIC` has better compatibility than `-fpic`

To determine whether an existing object file has been compiled with the `–fPIC` option:

- Without PIC
  - `readelf -d foo.so | grep TEXTREL`
  - `objdump --all-headers libfoo.so | grep TEXTREL`
- With PIC
  - `readelf -s mod1.o | grep _GLOBAL_OFFSET_TABLE_`
  - `nm mod1.o | grep _GLOBAL_OFFSET_TABLE_`

### PIE: position-independent executable

**PLT** Procedure Linkage Table: lazy binding for function

```
/* .got section (for data) redressed by .rel.syn */

address of a
address of b

/* .got.plt section (for function) redressed by .rel.plt */

address of .dynamic
module ID "lib.so"
address of _dl_runtime_resolve(index, moduleID)

address of bar
address of foo
...

/* .plt.got section */

???

/* .plt section */

 /* entry 1: the special one */
PLT0:
push *(GOT+4/8) # module ID "lib.so"
jmp *(GOT+8/16)  # address of _dl_runtime_resolve()
nop ...  # padding, each entry hava the same size

 /* entry 2 */
bar@plt:
jmp *(bar@GOT)
push n  # index of symbol bar in .rel.plt section
jmp PLT0
```

**.interp section**: contains a string of the path of ld.so

```bash
objdump -s a.out
readelf -l a.out | grep interpreter
```

**.dynamic section**: direct linking procedure

```bash
readelf -d liba.so
0x0000000000000001 (NEEDED)    Shared library: [libc.so.6]
0x000000006ffffef5 (GNU_HASH)  0x1f0
0x0000000000000003 (PLTGOT)    0x201000
...

objdump -R 
# show relocation entry for dynamic object (NEEDED entries)
```

**global symbol interpose**: if two dynamic symbol have the same name, then the latter loaded one would be ignored.

**.dynsym section**: subset of .symtab, for faster symbol search while linking

## so-name

- real name: `libname.so.x.y.z`
  - x major version number: no backward compatibility
    - symbol link `libname.so.x`
  - y minor version number: add some interfaces
  - z release version number: no change in interfaces
- **soname**: `libname.so.x`: usually a symbolic link to real name
- linker name: `libname.so`: usually a symbolic link to soname 

After installation, the symbolic links for the soname and linker name must be created, usually as relative symbolic links in the same directory as the library file.

We can use linking script to control the symbol visibility. [TODO]

ldconfig -v
{{ site.bin_option_style }}

Update symbolic links

–Wl,–soname,libbar.so.1
{{ site.bin_option_style }}

Specify the soname. Note that if the soname and the filename are not the same, we usually create a symbolic for dynamic linker to find the library (it search the library by filename).

objdump -p libfoo.so.1 \| grep SONAME
{{ site.bin_option_style }}

readelf -d libfoo.so.1 \| grep SONAME
{{ site.bin_option_style }}

Check the soname

-Wl,--version-script,myscriptfile.map
{{ site.bin_option_style }}

Verison script (can used for symbol verison control).

## Dynamic Linker

/lib/ld-version.so
{{ site.bin_option_style }}

`LD_PRELOAD`, env var, space-separated or colon-separated filenames : load the libraries even if the program do not need them. 

Where to find `libname.so` 

- `-Wl,-rpath=. ` compiling option. `DT_RPATH` or `DT_RUNPATH` tag in ELF
  - `-Wl,-rpath,'$ORIGIN'/lib`: The dynamic linker interprets the string `$ORIGIN` to mean “the directory containing the application.
  - `objdump -p prog | grep RPATH`
- `LD_RUN_PATH`: it is employed only if the `–rpath` option is not specified when building the executable.
- `LD_LIBRARY_PATH`, env var. Semicolons can also be used to separate the directories, in which case the list must be quoted to prevent the shell from interpreting the semicolons.
  - Security consideration: If the executable is a set-user-ID (setuid) or set-group-ID (setgid) program, then `LD_LIBRARY_PATH` is ignored. 
- `/etc/ld.so.cache`, refreshed with `ldconfig`. Use `ldconfig -p` to displays the cached content.
- `/lib`
- `/usr/lib`
- paths in `/etc/ld.so.conf`

Symbol Overriding:

- the global symbol in the main program overrides the one in a library
- If a global symbol is defined in multiple libraries, use the first definition listed on the static link command line

\_\_attribute\_\_ ((constructor)) | \_\_attribute\_\_ ((destructor))
{{ site.bin_option_style }}

Define one or more functions that are executed automatically when a shared library is loaded and unloaded. 

-Wl,-Bsymbolic
{{ site.bin_option_style }}

Global symbols within a shared library should be preferentially bound to definitions (if they exist) within that library. Use this option when compile the library.

\_\_attribute\_\_ ((visibility("hidden")))
{{ site.bin_option_style }}

makes the symbol available across all source code files that compose the shared library, but prevents it from being visible outside the library.

-rdynamic (or --export-dynamic)
{{ site.bin_option_style }}

refer back to the symbols defined by the program when use "dlopen" to load a dynamic object. It also helps e.g. Glibc's `backtrace_symbols()` symbolizing the backtrace


## Runtime Linking API

```bash
#include <dlfcn.h>

ldconfig    # refresh cache for /usr/lib
ldconfig -p # print
ldd test    # list the shared libs that excutable file uses

void *dlopen(const char *filename, int flag);
  Flag:
    Mandatory : RTLD_LAZY, RTLD_NOW
    Optional: RTLD_GLOBAL RTLD_LOCAL
      global: The symbols defined by this library will be made available for symbol resolution of subsequently loaded libraries. (or compiled with -rdynamic flag)
		
char *dlerror(void);
	returns a human readable string describing the most recent error 
void *dlsym(void *handle, const char *symbol);
	Returns the address of the symbol
int dlclose(void *handle);
```

## Interposition

### Compile-time

use `#define malloc(size) mymalloc(size)` to cheat.

### Linking-time

`gcc -Wl,--wrap,malloc`

- resolve references to symbol `malloc` as `__wrap_malloc`
- resolve references to symbol `__real_malloc` as `malloc`

### Run-time

If `LD_PRELOAD` environment variable is set to a list of shared library pathnames (separated by spaces or colons), then the dynamic linker `ld-linux.so` will search them first.

```c
// compiled with -shared -fpic -o mymalloc.so mymalloc.c -ldl

#include <dlfcn.h>
void* malloc(size_t size) {
  void* (*mallocp)(size_t) = dlsym(RTLD_NEXT, "malloc");
  if ((error = dlerror())) {
    ...
  }
  ...
}
```





