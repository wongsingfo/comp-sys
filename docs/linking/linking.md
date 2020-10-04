---
layout: default
title: Linking
nav_order: 30
permalink: docs/linking
has_children: true
---

# Resources

- Binary File Descriptor library (BFD): the GNU Project's main mechanism for the portable manipulation of object files in a variety of formats. As of 2003, it supports approximately 50 file formats for some 25 instruction set architectures.
- [uclibc docs](https://uclibc.org/docs/), [uclibc intro](https://www.uclibc.org/FAQ.html)
- 程序员的自我修养

## Target

The triple has the general format `<arch><sub>-<vendor>-<sys>-<abi>`, where:

- `arch` = `x86_64`, `i386`, `arm`, `thumb`, `mips`, etc.
- `sub` = for ex. on ARM: `v5`, `v6m`, `v7a`, `v7m`, etc.
- `vendor` = `pc`, `apple`, `nvidia`, `ibm`, etc.
- `sys` = `none`, `linux`, `win32`, `darwin`, `cuda`, etc.
- `abi` = `eabi`, `gnu`, `android`, `macho`, `elf`, etc.

## Static Library

```bash
# Insert an object file into the archive, replacing any previous object file of the same name. 
ar r libdemo.a mod1.o mod2.o mod3.o 
# table of content + verbose
ar tv libdemo.a
# delete 
ar d libdemo.a mod3.o
# eXtract file.o 
ar x arhiva.a file.o 
```

-L dir
{{ site.bin_option_style }}

search this additional directory

-l name
{{ site.bin_option_style }}

Link static library `libname.a`

–Wl,–Bstatic  |  –Wl,–Bdynamic
{{ site.bin_option_style }}

Explicitly toggle the linker’s choice between static and shared libraries.

## Linking Script

```
/* Simple linker script for JOS user-level programs.
   See the GNU ld 'info' manual ("info ld") to learn the syntax. */

OUTPUT_FORMAT("elf32-i386", "elf32-i386", "elf32-i386")
OUTPUT_ARCH(i386)
ENTRY(_start)

SECTIONS
{
	/* Load programs at this address: "." means the current address */
	. = 0x800020;

	.text : {
		*(.text .stub .text.* .gnu.linkonce.t.*)
	}

	PROVIDE(etext = .);	/* Define the 'etext' symbol to this value */

	.rodata : {
		*(.rodata .rodata.* .gnu.linkonce.r.*)
	}

	/* Adjust the address for the data segment to the next page */
	. = ALIGN(0x1000);

	.data : {
		*(.data)
	}

	PROVIDE(edata = .);

	.bss : {
		*(.bss)
	}

	PROVIDE(end = .);


	/* Place debugging symbols so that they can be found by
	 * the kernel debugger.
	 * Specifically, the four words at 0x200000 mark the beginning of
	 * the stabs, the end of the stabs, the beginning of the stabs
	 * string table, and the end of the stabs string table, respectively.
	 */

	.stab_info 0x200000 : {
		LONG(__STAB_BEGIN__);
		LONG(__STAB_END__);
		LONG(__STABSTR_BEGIN__);
		LONG(__STABSTR_END__);
	}

	.stab : {
		__STAB_BEGIN__ = DEFINED(__STAB_BEGIN__) ? __STAB_BEGIN__ : .;
		*(.stab);
		__STAB_END__ = DEFINED(__STAB_END__) ? __STAB_END__ : .;
		BYTE(0)		/* Force the linker to allocate space
				   for this section */
	}

	.stabstr : {
		__STABSTR_BEGIN__ = DEFINED(__STABSTR_BEGIN__) ? __STABSTR_BEGIN__ : .;
		*(.stabstr);
		__STABSTR_END__ = DEFINED(__STABSTR_END__) ? __STABSTR_END__ : .;
		BYTE(0)		/* Force the linker to allocate space
				   for this section */
	}

	/DISCARD/ : {
		*(.eh_frame .note.GNU-stack .comment)
	}
}
```

