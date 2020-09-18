---
layout: default
title: Tracing
parent: Computer System
nav_order: 10
mathjax: false
---

# Tracing
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC

{:toc}

## Back-end

config:

```
CONFIG_KPROBES 
CONFIG_FUNCTION_TRACER
CONFIG_FUNCTION_GRAPH_TRACER 
CONFIG_NET_ACT_BPF
CONFIG_BPF_JIT 
CONFIG_SHADOW_CALL_STACK  # turn it off
CONFIG_ROP_PROTECTION_NONE
CONFIG_KRETPROBES
```

### kprobe / kretprobe

https://www.kernel.org/doc/html/latest/trace/kprobes.html

- kprobe: can be inserted on virtually any instruction
- kretprobes / return probes: fires when a specified function returns

```c
register_/unregister_probe()
register_/unregister_kretprobe()
register_/unregister_*probes()
```

How does probes work

- makes a copy of the probed instruction
  - reason: (It would be simpler to single-step the actual instruction in place, but then Kprobes would have to temporarily remove the breakpoint instruction. This would open a small time window when another CPU could sail right past the probepoint.) 
- replaces the first byte(s) of the probed instruction with a breakpoint instruction (e.g., int3 on i386 and x86_64).
- When a CPU hits the breakpoint instruction, control passes to Kprobes via the notifier_call_chain mechanism
  - executes the “pre_handler”
    - you can change the `ip` register and must return `!0` so that kprobes stops single stepping and just returns to the given address
  - single-steps its copy of the probed instruction
  - executes the “post_handler"
- return from the trap

How does kretprobes work

- Kprobes establishes a **kprobe** at the entry to the function
- When the probed function is called and this probe is hit, Kprobes saves a copy of the return address, and replaces the return address with the address of a “trampoline.”
- Kprobes’ trampoline handler calls the user-specified return handler associated with the kretprobe
- kretprobe_instance objects
  - store the return address of the probed function
  - the number of it is set by user in the `maxactive` field
  - If miss, `nmissed` is incremented every time.

### tracepoint

A **tracepoint** placed in code provides a **hook** to call a function (**probe**) that you can provide at runtime. 

https://www.kernel.org/doc/html/latest/trace/tracepoints.html

You can find and use all tracepoints at `/sys/kernel/debug/tracing/events`. A tracepoint is identified as `subsys:name` (for example `net:netif_receive_skb`).

### BPF

tracepoint in BPF:

- BPF_PROG_TYPE_TRACEPOINT: this program type gives access to the `TP_STRUCT_entry` data available at tracepoint entry; i.e. the data assigned from the raw tracepoint arguments via the `TP_fast_assign()` section in the tracepoint definition.
- BPF_PROG_TYPE_RAW_TRACEPOINT: BPF programs are in this case provided with the raw arguments to the tracepoint.

## Front-end

### SystemTap (stap)

https://sourceware.org/systemtap/documentation.html

https://sourceware.org/systemtap/wiki

https://wiki.ubuntu.com/Kernel/Systemtap

https://sourceware.org/systemtap/wiki/SystemTapOnAndroidARM

how it works:

- `/usr/share/systemtap/tapset/` for tapsets used
- translates the script to C, running the system C compiler to create a kernel module from it
- loads the module, then enables all the probes (events and handlers) in the script
- run **handlers** when **events** occurs
- Once the SystemTap session is terminated, the probes are disabled, and the kernel module is unloaded.

It's triggered on event likes entering/exiting a function, timer expiration, session termination, etc.

Note: the timestamps on the SystemTap output are not increasing: **it is not safe to infer temporal ordering from SystemTap ouput.**

### BCC

https://github.com/iovisor/bcc

what can it do

- syscall: execsnoop, opensnoop
- disk: ext4slower, biolatency, biosnoop, cachestat
- tcp: tcpconnect, tcpaccept, tcpretrans
- scheduling: runqlat
- function: profile(sample stacktrace)

how does it works:

- kprobe
- tracepoint
- bpf

https://github.com/iovisor/bcc/blob/master/docs/tutorial_bcc_python_developer.md

quick example:

```c
BPF_PERF_OUTPUT(ipv4_events);
ipv4_events.perf_submit(args, &data4, sizeof(data4));

BPF_HASH(ipv4_count, struct ipv4_flow_key_t, /*default: u64*/);
ipv4_count.increment(flow_key);

BPF_HISTOGRAM(dist);
dist.increment(bpf_log2l(req->__data_len / 1024));

int trace_return(struct pt_regs *ctx, /*args...*/);
```

```python
b = BPF(text=bpf_text) # C code
b.attach_kprobe(event="tcp_retransmit_skb", fn_name="trace_retransmit")
b["ipv4_events"].open_perf_buffer(print_ipv4_event)
b.perf_buffer_poll()

# print hist
b.get_table("ipv4_count")
```

### perf

```bash
perf record -e net:netif_receive_skb
```

