---
layout: default
title: ELF in 30 Minutes
parent: Linking
nav_order: 20
---

# Executable and Linking Format
{: .no_toc }

References:

- [Tool Interface Standard (TIS) Executable and Linking Format (ELF) Specification Version 1.2](https://pdos.csail.mit.edu/6.828/2018/readings/elf.pdf) (32 bits)
- [Executable and Linkable Format (ELF)](http://www.skyfree.org/linux/references/ELF_Format.pdf)
- [ELF-64 Object File Format](https://uclibc.org/docs/elf-64-gen.pdf)
- [Linux Manual -- objdump(1)](http://man7.org/linux/man-pages/man1/objdump.1.html)
- [Linux Manual -- readelf(1)](http://man7.org/linux/man-pages/man1/readelf.1.html)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

There are three main types of object files.

- A relocatable file holds code and data suitable for linking with other object files to create an executable or a shared object file.
- An executable file holds a program suitable for execution.
- A shared object file holds code and data suitable for linking in two contexts. First, the link editor may process it with other relocatable and shared object files to create another object file. Second, the dynamic linker combines it with an executable file and other shared objects to create a process image.

## Data Structure

|               | **Size** | **Signed** |
| ------------- | -------- | ---------- |
| Elf32_Addr    | 4        | n          |
| Elf32_Half    | 2        | n          |
| Elf32_Off     | 4        | n          |
| Elf32_Sword   | 4        | y          |
| Elf32_Word    | 4        | n          |
| unsigned char | 1        | n          |

(for 32-bit class only!!!)

A ELF file contains:

- ELF Header
- Program Header Table (mandatory in linking view)
- Section 1
- Section 2
- ...
- Section n
- Section Header Table (mandatory in execution view)

{% include img.html filename="xkGtg.jpg" %}

## ELF Header

```c
#define ELF_MAGIC 0x464C457FU	/* "\x7FELF" in little endian */
#define EI_NIDENT 16

struct Elf {
	unsigned char e_ident[EI_NIDENT]; 
	Elf32_Half e_type;
	Elf32_Half e_machine; 
	Elf32_Word e_version; 
	Elf32_Addr e_entry;
	Elf32_Off e_phoff;
	Elf32_Off e_shoff; 
	Elf32_Word e_flags; 
	Elf32_Half e_ehsize; 
	Elf32_Half e_phentsize; 
	Elf32_Half e_phnum; 
	Elf32_Half e_shentsize; 
	Elf32_Half e_shnum; 
	Elf32_Half e_shstrndx;
};
```

About ELF Header:

- `e_ident`:
  - the first 4 bytes must equal to `ELF_MAGIC`
  - `e_ident[4]` represents the file class:
    - 1 : 32 bits
    - 2 : 64 bits
  - `e_ident[5]` represents the data encoding:
    - 1 : little endian
    - 2 : big endian
- `e_ehsize`: This member holds the ELF header's size in bytes.
- `e_entry`: This member is the virtual address to which the system first transfers control, thus starting the process.

About Program Header:

- `e_phoff`: program header table offset
- `e_phnum`: number of program entries
- `e_phentsize`: program entry size

About Section Header:

- `e_shoff`: section header table offset
- `e_shnum`: number of section entries
- `e_shentsize`: section entry size
- `e_shstrndx`: This member holds the section header table index of the entry associated with the section name string table.

## Section Header Entry

```c
struct Secthdr {
	uint32_t sh_name;
	uint32_t sh_type;
	uint32_t sh_flags;
	uint32_t sh_addr;
	uint32_t sh_offset;
	uint32_t sh_size;
	uint32_t sh_link;
	uint32_t sh_info;
	uint32_t sh_addralign;
	uint32_t sh_entsize;
};
```

- `sh_name`: The section name. Its value is an index into the section header **string table section**
- `sh_addr`: If the section will appear in the memory image of a process, this member gives the address at which the section's first byte should reside.
- `sh_offset`: the offset to the section (except for SHT_NOBITS section, which does not occupy space)
- `sh_size`: the section size
- `sh_addralign`: address alignment constraints
- `sh_entsize`: Some sections hold a table of fixed-size entries, such as a **symbol table**. This member gives the size in bytes of each entry.
- `sh_type`:
  - SHT_PROGBITS: information defined by the program, whose format and meaning are determined solely by the program.
  - SHT_SYMTAB and SHT_DYNSYM: symbol table
  - SHT_STRTAB: string table
  - SHT_DYNAMIC: for dynamic linking
  - SHT_HASH: a symbol hash table
  - and others
- `sh_flags`:
  - SHF_WRITE: contains data that should be writable during process execution
  - SHF_ALLOC: occupies memory during process execution
  - SHF_EXECINSTR: contains executable machine instructions

Some section header table indexes are reserved; an object file will not have sections for these special indexes.

objdump -s
{{ site.bin_option_style }}

Display the full contents of any sections requested (like `hexdump`). By default all non-empty sections are displayed.

objdump -dj [section name]
{{ site.bin_option_style }}

```
Disassembly of section .rodata:

0000000000400580 <_IO_stdin_used>:
  400580:       01 00 02 00                                         ....
```

readelf -x [section name]
{{ site.bin_option_style }}

```
Hex dump of section '.text':
  0x004003e0 31ed4989 d15e4889 e24883e4 f0505449 1.I..^H..H...PTI
  0x004003f0 c7c07005 400048c7 c1000540 0048c7c7 ..p.@.H....@.H..
  0x00400400 e4044000 e8b7ffff fff4660f 1f440000 ..@.......f..D..
```

readelf -S
{{ site.bin_option_style }}

```
  [25] .data             PROGBITS         0000000000601020  00001020
       0000000000000010  0000000000000000  WA       0     0     8
  [26] .bss              NOBITS           0000000000601030  00001030
       0000000000000008  0000000000000000  WA       0     0     1
  [27] .comment          PROGBITS         0000000000000000  00001030
       0000000000000035  0000000000000001  MS       0     0     1
  [28] .shstrtab         STRTAB           0000000000000000  000018cb
       000000000000010c  0000000000000000           0     0     1
  [29] .symtab           SYMTAB           0000000000000000  00001068
       0000000000000660  0000000000000018          30    47     8
  [30] .strtab           STRTAB           0000000000000000  000016c8
       0000000000000203  0000000000000000           0     0     1.2
```

### Special Section
{: .no_toc}

Various sections in ELF are pre-defined and hold program and control information. These Sections are used by the **operating system** and have different types and attributes for **different** operating systems.

| Name      | Type         | Attribute           |
| --------- | ------------ | ------------------- |
| .bss      | SHT_NOBITS   | SHF_ALLOC+SHF_WRITE |
| .comment (for version control)  | SHT_PROGBITS | none                |
| .data     | SHT_PROGBITS | SHF_ALLOC+SHF_WRITE |
| .data1    | SHT_PROGBITS | SHF_ALLOC+SHF_WRITE |
| .debug    | SHT_PROGBITS | none                |
| .dynamic  | SHT_DYNAMIC  |                     |
| .hash     | SHT_HASH     | SHF_ALLOC           |
| .line     | SHT_PROGBITS | none                |
| .note     | SHT_NOTE     | none                |
| .rodata   | SHT_PROGBITS | SHF_ALLOC           |
| .rodata1  | SHT_PROGBITS | SHF_ALLOC           |
| .shstrtab  (section names) | SHT_STRTAB   | none                |
| .strtab (strings talbe) | SHT_STRTAB   |                     |
| .symtab (symbol table)  | SHT_STRTAB   |  SHF_ALLOC / none   |
| .text     | SHT_PROGBITS | SHF_ALLOC+SHF_EXECINSTR |

File segments may be relocated to nonstandard addresses, for example by using the `-Ttext`, `-Tdata`, or `-Tbss` options to `ld`.

### String Table

String the contain most commonly the strings that represent the names associated with symbol table entries. For String `abc`, `e`, and a null string, the table is like (The first `\0` is reserved): 

```
\0abc\0e\0\0
```

### Symbol Table Entry

```c
struct Elf32_Sym {
	Elf32_Word st_name;
	Elf32_Addr st_value; 
	Elf32_Word st_size; 
	unsigned char st_info; 
	unsigned char st_other; 
	Elf32_Half st_shndx;
};
```

- `st_name`: holds an index into the object file's symbol string table
- `st_value`: gives the value of the associated symbol. Depending on the context, this may be an absolute value, an address, and so on.
  - In relocatable files, `st_value` holds alignment constraints for a symbol whose section index is SHN_COMMON
  - In relocatable files, `st_value` holds a section offset for a defined symbol. That is, st_value is an offset from the beginning of the section that `st_shndx` identifies.
  - In executable and shared object files, `st_value` holds a virtual address. To make these files' symbols more useful for the dynamic linker, the section offset (file interpretation) gives way to a virtual address (memory interpretation) for which the section number is irrelevant.
- `st_size`: Many symbols have associated sizes. For example, a data object's size is the number of bytes contained in the object. This member holds 0 if the symbol has no size or an unknown size.
- `st_shndx`: Every symbol table entry is "defined'' in relation to some section; this member holds the relevant section header table index.
- `st_info`: specifies the symbol's type and binding attribute
```
#define ELF32_ST_BIND(i) ((i)>>4) 
#define ELF32_ST_TYPE(i) ((i)&0xf) 
#define ELF32_ST_INFO(b,t) (((b)<<4)+((t)&0xf))
```
  - bind:
    - STB_LOCAL (0): not visible outside the object file containing their definition. Local symbols of the same name may exist in multiple files without interfering with each other.
    - STB_GLOBAL (1)
    - STB_WEAK (2): Weak symbols resemble global symbols, but their definitions have lower precedence. 
  - type: 
    - STT_OBJECT(1): associated with a data object, such as a variable, an array, and so on.
    - STT_FUNC(2): associated with a function or other executable code.
  - info:
    - SHN_ABS: an absolute value that will not change because of relocatio
    - SHN_COMMON: The symbol labels a common block that has not yet been allocated. The symbol's value gives alignment constraints, similar to a section's sh_addralign member. That is, the link editor will allocate the storage for the symbol at an address that is a multiple of st_value. The symbol's size tells how many bytes are required.
    - SHN_UNDEF


objdump -t
{{ site.bin_option_style }}

Print the symbol table entries of the file. 

```
0000000000601000 l     O .got.plt       0000000000000000              _GLOBAL_OFFSET_TABLE_
0000000000400580 g     O .rodata        0000000000000004              _IO_stdin_used
0000000000400500 g     F .text  0000000000000065              __libc_csu_init
00000000004004d6 g     F .text  0000000000000007              fo
0000000000601038 g       .bss   0000000000000000              _end
00000000004003e0 g     F .text  000000000000002a              _start
0000000000601030 g       .bss   0000000000000000              __bss_start
00000000004004e4 g     F .text  0000000000000015              main
0000000000000000  w      *UND*  0000000000000000              _Jv_RegisterClasses
0000000000601030 g     O .data  0000000000000000              .hidden __TMC_END__
0000000000000000  w      *UND*  0000000000000000              _ITM_registerTMCloneTable
0000000000400390 g     F .init  0000000000000000              _init
```

### Objdump



-r
{{ site.bin_option_style }}

Print the relocation entries of the file.  If used with `-d` or `-D`, the relocations are printed interspersed with the disassembly (the save for `-R`).

```
RELOCATION RECORDS FOR [.text]:
OFFSET           TYPE              VALUE 
0000000000000007 R_X86_64_PC32     .rodata-0x0000000000000004
000000000000000c R_X86_64_PLT32    puts-0x0000000000000004
```

-R
{{ site.bin_option_style }}

Print the dynamic relocation entries of the file.  This is only meaningful for dynamic objects, such as certain types of shared libraries.

## Program Header

```c
struct Proghdr {
	uint32_t p_type;
	uint32_t p_offset;
	uint32_t p_va;
	uint32_t p_pa;
	uint32_t p_filesz;
	uint32_t p_memsz;
	uint32_t p_flags;
	uint32_t p_align;
};
```

An executable or shared object file's program header table is an array of structures, each describing a segment or other information the system needs to prepare the program for execution. An object file segment contains one or more sections. Program headers are meaningful only for executable and shared object files.

- `p_vaddr`: This member gives the virtual address at which the first byte of the segment resides in memory.
- `p_filesz`: This member gives the number of bytes in the file image of the segment; it may be zero.
- `p_paddr`: On systems for which physical addressing is relevant, this member is reserved for the segment's physical address. This member requires operating system specific information.
- `p_memsz`: This member gives the number of bytes in the memory image of the segment; it may be zero.

readelf -l
{{ site.bin_option_style }}

Displays the information contained in the file's segment headers.

```
Program Headers:
  Type           Offset             VirtAddr           PhysAddr
                 FileSiz            MemSiz              Flags  Align
  PHDR           0x0000000000000040 0x0000000000400040 0x0000000000400040
                 0x00000000000001f8 0x00000000000001f8  R E    8
  INTERP         0x0000000000000238 0x0000000000400238 0x0000000000400238
                 0x000000000000001c 0x000000000000001c  R      1
      [Requesting program interpreter: /lib64/ld-linux-x86-64.so.2]

 Section to Segment mapping:
  Segment Sections...
   00     
   01     .interp 
   02     .interp .note.ABI-tag .note.gnu.build-id .gnu.hash .dynsym .dynstr .gnu.version .gnu.version_r .rela.dyn .rela.plt .init .plt .plt.got .text .fini .rodata .eh_frame_hdr .eh_frame
```

objdump -h
{{ site.bin_option_style }}

```
Idx Name          Size      VMA               LMA               File off  Algn
  0 .interp       0000001c  0000000000400238  0000000000400238  00000238  2**0
                  CONTENTS, ALLOC, LOAD, READONLY, DATA
  1 .note.ABI-tag 00000020  0000000000400254  0000000000400254  00000254  2**2
                  CONTENTS, ALLOC, LOAD, READONLY, DATA
```

- LMA (load address): address that section should be loaded into memory (change the LMA by passing `-Ttext 0x7C00` to linker).
- VMA (link address): address form which the section expects to execute. 
A binary may not get the address of a global variable if it is executing from an address that it is not linked for. (may be fixed by PIC)
- Typically, LMA and VMA are the same.
