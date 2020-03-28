---
layout: default
title: Shell Script in 30 Minutes
parent: Script
nav_order: 80
---

# Shell Script in 30 Minutes
{: .no_toc }

## References
{: .no_toc .text-delta }

- [Missing Semester](https://missing.csail.mit.edu/)
- zsh, oh-my-zsh, zsh-history-substring-search,  zsh-syntax-highlighting
- [TLDR page](https://tldr.sh)
- [shellcheck](https://github.com/koalaman/shellcheck) 
- [enhanced grep: rg](https://github.com/BurntSushi/ripgrep)
- autojump
- [fuzzy search: fasd](https://github.com/clvv/fasd)
- [regex debugger: regex101](https://regex101.com/)
- [Parsing HTML: pup](https://github.com/EricChiang/pup)
- [Parsing JSON: jq](https://stedolan.github.io/jq/manual/)

- `bc`: calculator
- `paste`
- `sed`, `awk`
- `sort`, `uniq`
- `xargs`
- `tput bel`: alert when jobs finish
- `sshfs`: [osxfuse](https://github.com/osxfuse/osxfuse/wiki/SSHFS)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## system log

```
logger "Hello Logs"
# On macOS
log show --last 1m | grep Hello
# On Linux
journalctl --since "1m ago" | grep Hello
```

In addition, most UNIX systems you can also use the `dmesg` command to access the kernel log.

## ssh

- [A network filesystem client to connect to SSH servers: sshfs](https://github.com/libfuse/sshfs)
- [Remote terminal application that allows roaming: mosh](https://mosh.org/#getting), error: [The locale requested by LC_CTYPE=UTF-8 isn't available here.](https://github.com/mobile-shell/mosh/issues/793)
- tmux
- [blog: A look at terminal emulators](https://anarc.at/blog/2018-04-12-terminal-emulators-1/)

```bash
apt-get update
apt-get install -y locales
locale-gen "en_US.UTF-8"
update-locale LC_ALL="en_US.UTF-8"

## Then, add the following lines to ~/.bashrc and ~/.profile: 
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
export LANGUAGE=en_US.UTF-8
```

```bash
ssh-keygen -t rsa -b 4096 -C "wongck@pku.edu.cn"
ssh-keygen -o -a 100 -t ed25519 -f ~/.ssh/id_ed25519

ssh-copy-id id@server -p [port] # by default, use ~/.ssh/id_rsa
ssh-copy-id id@server -p [port] -i ~/.ssh/id_ed25519.pub
```

Port Forwarding ([credit](https://unix.stackexchange.com/questions/115897/whats-ssh-port-forwarding-and-whats-the-difference-between-ssh-local-and-remot)): For example, if we execute jupyter notebook in the remote server that listens to the port 8888. Thus, to forward that to the local port 9999, we would do `ssh -L 9999:localhost:8888 foobar@remote_server` and then navigate to `locahost:9999` in our local machine. 

Local Port Forwarding:

{% include img.html filename="a28N8.png" width=500 %}

Remote Port Forwarding:

{% include img.html filename="4iK3b.png" width=500 %}

## Variable

```bash
#!/bin/bash

# This bash script is used to backup a user's home directory to /tmp/.

user=$(whoami)
input=/home/$user
output=/tmp/${user}_home_$(date +%Y-%m-%d_%H%M%S).tar.gz
echo "$user"  # wck
echo '$user'  # $user

tar -czf $output $input
echo "Backup of $input completed! Details about the output backup file:"
ls -l $output

counter=0
let counter+=1
let all=$all+$arch_files+$arch_directories
```

## Array

```bash
declare -a my_array # indexed array
declare -A my_array # associative array

my_array=(foo bar)
my_array[0]=foo
for i in "${my_array[@]}"; do echo "$i"; done  # => foo bar
for i in "${!my_array[@]}"; do echo "$i"; done # => 0 1
echo "the array contains ${#my_array[@]} elements"

my_array+=(baz)
```

## Globbing

```bash
mv *{.py,.sh} folder
touch {foo,bar}/{a..j}
```

## Pipe

[Process Substitution](https://www.gnu.org/software/bash/manual/html_node/Process-Substitution.html#Process-Substitution)

> If the `>(list)` form is used, writing to the file will provide input for `list`. If the `<(list)` form is used, the file passed as an argument should be read to obtain the output of `list`.

```bash
2> /dev/null
&> /dev/null   # both stdout and stderr

# <( CMD ) will execute CMD and place the output in a 
# temporary file and substitute the <() with that file’s name. 
diff <(ls foo) <(ls bar) 

# >( CMD ) appears as a file and writing to this file provides
# input for CMD as STDIN
echo "example" | tee >(xargs mkdir) >(wc -c)

$ cat << END
> asdf
> qwerty
> END
```

## Function

```bash
function total_files {
  find $1 -type f | wc -l
  echo $0  # the name of the function
  echo $1 $2 $4
  echo $#  # number of args
  echo $@  # all args
}

total_files $input
```

A comprehensive list can be found [here](https://www.tldp.org/LDP/abs/html/special-chars.html).

- `$?` - Return code of the previous command
- `$$` - PID for the current script
- `!!` - Entire last command, including arguments. `sudo !!`
- `$_` - Last argument from the last command. If you are in an interactive shell, you can also quickly get this value by typing Esc followed by `.`

## Comparison

|           | numeric | string |
| --------- | ------- | ------ |
| less than | -lt     | <      |
|           | -ne     | !=     |
|           | -eq     | =      |
|           | -le     | N/A    |

0 signals true, 1 signals false

```bash
test EXPRESSION
[ EXPRESSION ]
[[ EXPRESSION ]]

[ 1 -nq 2 ]
echo $?  # => 0

if [ ! -d "/home/$1" ]; then
```

## Control

```bash
if [ $num_a -lt $num_b ]; then
	echo "haha"
elif
	:   # null command (like `pass` in python)
else
  :
fi

for i in 1 2 3; do
for i in $(ls); do
for directory in $*; do
    echo $i
done

until [ $counter -lt 3 ]; do
while [ $counter -lt 3 ]; do
    let counter-=1
    echo $counter
done
```

## getopts

```bash
while getopts ":o:h" o; do
    case "${o}" in
        o)
            do_something ${OPTARG}
            ;;
        h)
            usage
            exit 0
            ;;
        *)
            usage
            error unknow option
            exit 1
            ;;
    esac
done
```

## misc

```bash
trap 'kill $(jobs -p)' EXIT
# Watch out to use single ', to prevent the shell from substituting the $() immediately.

set -x 
# print before execution
set -e
# die on error
```


