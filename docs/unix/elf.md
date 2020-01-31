---
layout: default
title: ELF in 30 Minutes
parent: Unix World
nav_order: 20
---

# Executable and Linking Format
{: .no_toc }

References:

- [Tool Interface Standard (TIS) Executable and Linking Format (ELF) Specification Version 1.2](https://pdos.csail.mit.edu/6.828/2018/readings/elf.pdf)
- [Executable and Linkable Format (ELF)](http://www.skyfree.org/linux/references/ELF_Format.pdf)

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

- Elf
  - Program Header Table (optional in linking view)
  - Secthdr
  - Secthdr
  - ...
  - Secthdr
  - Section Header Table (optional in external view)

```c
#define ELF_MAGIC 0x464C457FU	/* "\x7FELF" in little endian */

struct Elf {
	uint32_t e_magic;	// must equal ELF_MAGIC
	uint8_t  e_elf[12];
	uint16_t e_type;
	uint16_t e_machine;
	uint32_t e_version;
	uint32_t e_entry;
	uint32_t e_phoff;
	uint32_t e_shoff;
	uint32_t e_flags;
	uint16_t e_ehsize;
	uint16_t e_phentsize;
	uint16_t e_phnum;
	uint16_t e_shentsize;
	uint16_t e_shnum;
	uint16_t e_shstrndx;
};

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

## ELF Header

About ELF Header:

- `e_ehsize`: This member holds the ELF header's size in bytes.
- `e_entry`: This member is the virtual address to which the system first transfers control, thus starting the process.

About Program Header:

- `e_phoff`: This member holds the program header table's file offset in bytes. If the file has no program header table, this member holds zero.
- `e_phnum`: This member holds the number of entries in the program header table. Thus the product of `e_phentsize` and `e_phnum` gives the table's size in bytes. If a file has no program header table, e_phnum holds the value zero.

About Section Header:

- `e_shoff`: This member holds the section header table's file offset in bytes. If the file has no section header table, this member holds zero.
- `e_shnum`: This member holds the number of entries in the section header table. Thus the product of e_shentsize and e_shnum gives the section header table's size in bytes. If a file has no section header table, e_shnum holds the value zero.

## Section Header

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

### String Table

String the contain most commonly the strings that represent the names associated with symbol table entries. For String `abc`, `e`, and a null string, the table is like (The first `\0` is reserved): 

```
\0abc\0e\0\0
```

### Symbol Table

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
- `st_shndx`:
  - STB_LOCAL (0): not visible outside the object file containing their definition. Local symbols of the same name may exist in multiple files without interfering with each other.
  - STB_GLOBAL (1)
  - STB_WEAK (2): Weak symbols resemble global symbols, but their definitions have lower precedence. 
- `st_info`: specifies the symbol's type and binding attribute
```
#define ELF32_ST_BIND(i) ((i)>>4) 
#define ELF32_ST_TYPE(i) ((i)&0xf) 
#define ELF32_ST_INFO(b,t) (((b)<<4)+((t)&0xf))
```
  - type: 
    - STT_OBJECT(1): associated with a data object, such as a variable, an array, and so on.
  	- STT_FUNC(2): associated with a function or other executable code.
  - info:
    - SHN_ABS: an absolute value that will not change because of relocatio
    - SHN_COMMON: The symbol labels a common block that has not yet been allocated. The symbol's value gives alignment constraints, similar to a section's sh_addralign member. That is, the link editor will allocate the storage for the symbol at an address that is a multiple of st_value. The symbol's size tells how many bytes are required.
    - SHN_UNDEF

## Program Header

An executable or shared object file's program header table is an array of structures, each describing a segment or other information the system needs to prepare the program for execution. An object file segment contains one or more sections. Program headers are meaningful only for executable and shared object files.

<div class="code-example" markdown="1">
- LMA (load address): address that section should be loaded into memory (change the LMA by passing `-Ttext 0x7C00` to linker).
- VMA (link address): address form which the section expects to execute. 
A binary may not get the address of a global variable if it is executing from an address that it is not linked for. (may be fixed by PIC)
- Typically, LMA and VMA are the same.
</div>

- `p_vaddr`: This member gives the virtual address at which the first byte of the segment resides in memory.
- `p_filesz`: This member gives the number of bytes in the file image of the segment; it may be zero.
- `p_paddr`: On systems for which physical addressing is relevant, this member is reserved for the segment's physical address. This member requires operating system specific information.
- `p_memsz`: This member gives the number of bytes in the memory image of the segment; it may be zero.
