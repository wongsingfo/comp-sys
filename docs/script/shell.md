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
- [Documentation](http://www.gnu.org/savannah-checkouts/gnu/bash/manual/bash.html)
- [Google Style Guide](https://google.github.io/styleguide/shellguide.html)
- [Advanced Bash-Scripting Guide](http://www.tldp.org/LDP/abs/html/index.html)
- zsh, oh-my-zsh, zsh-history-substring-search,  zsh-syntax-highlighting
- [TLDR page](https://tldr.sh)
- [KMDR page](https://github.com/ediardo/kmdr-cli)
- [shellcheck](https://github.com/koalaman/shellcheck) 
- [explainshell](https://explainshell.com/)
- [enhanced grep: rg](https://github.com/BurntSushi/ripgrep)
- autojump
- [fuzzy search: fasd](https://github.com/clvv/fasd)
- [regex debugger: regex101](https://regex101.com/)
- [Parsing HTML: pup](https://github.com/EricChiang/pup)
- [Parsing JSON: jq](https://stedolan.github.io/jq/manual/)
- [httpie](https://httpie.org/)
- recorder: [showterm](https://github.com/ConradIrwin/showterm)
- `bc`: calculator
- `tr`
- `sed`, `awk`
- `diff`, `patch`
- `sort`, `uniq`, `shuf`
- `xargs`
- `tput bel`: alert when jobs finish
- `sshfs`: [osxfuse](https://github.com/osxfuse/osxfuse/wiki/SSHFS).   `service nfsclient start && mount server:/dir /mount_dir`
- `column -t`, `paste`, `cut`, `join`, `split`
- `od`, `hexdump`
- `mtr`: a replacement for `routetrace`
- `dd if=/home/pete/backup.img of=/dev/sdb bs=1M count=2`
- `aria2c -x 16 -s 16 [url]`: file downloader 
- expect (Recommended: Exploring Expect: A Tcl-Based Toolkit for Automating Interactive Programs)
- `tput` set [color](https://stackoverflow.com/questions/5947742/how-to-change-the-output-color-of-echo-in-linux)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

```bash
#!/bin/bash

#######################################
# Delete a file in a sophisticated manner.
# Arguments:
#   File to delete, a path.
# Returns:
#   0 if thing was deleted, non-zero on error.
#######################################
function del_thing() {
  rm "$1"
}
```

If you are writing a script that is more than 100 lines long, or that uses non-straightforward control flow logic, you should rewrite it in a more structured language *now*!!!!

## ssh

- [A network filesystem client to connect to SSH servers: sshfs](https://github.com/libfuse/sshfs)
- [Remote terminal application that allows roaming: mosh](https://mosh.org/#getting), error: [The locale requested by LC_CTYPE=UTF-8 isn't available here.](https://github.com/mobile-shell/mosh/issues/793)
- tmux
- [blog: A look at terminal emulators](https://anarc.at/blog/2018-04-12-terminal-emulators-1/)
- [How to exit: `~.`](https://unix.stackexchange.com/questions/196701/terminal-hang-when-lost-connection-and-ssh-is-on). `~` is the escape character. (Opppp, it does not work on my laptop :( )

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

## Variable

```bash
# 'Single' quotes indicate that no substitution is desired.
# "Double" quotes indicate that substitution is required/tolerated.


# This bash script is used to backup a user's home directory to /tmp/.

user=$(whoami)
input=/home/$user
output=/tmp/${user}_home_$(date +%Y-%m-%d_%H%M%S).tar.gz
echo "$user"  # wck
echo '$user'  # $user

tar -czf $output $input
echo "Backup of $input completed! Details about the output backup file:"
ls -l $output

# https://stackoverflow.com/questions/965053/extract-filename-and-extension-in-bash
filename=$(basename -- "$fullfile")
extension="${filename##*.}"
```

## Numbers / Strings / Timestamps

```bash
counter=0
let counter+=1
let all=$all+$arch_files+$arch_directories

# substring s[2..]
s=$(echo $s | cut -c2-)

i=64
let i=i/31
echo $i  # 2

# built-in Arithmetic Expansion substitution in POSIX shells
$((0xbc))         # 188
$((1+2+5*2))      # 13
$((16#55))        # 85
$((10#85))        # 55

printf '%x\n' 85  # 55
echo 'obase=16; 9999999999999999999999' | bc  # 21E19E0C9BAB23FFFFF

echo 416E64726F69644C6162 | xxd -r -p         # AndroidLab

date +"%Y-%m-%d %H:%M:%S"  # 2020-05-13 12:38:13
date +"%s"                 # 1598082285
date -d '04/05/2017 11:13:00' +"%s"  # 1491361980
date -d '04/05/2017 11:13:00'        # depends on the system language
date -d @1491361980 +"%Y-%m-%d %H:%M:%S"  # 2017-04-05 11:13:00
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

# Here Documents, similar to cat file, while the file content contains asdf\nqwerty
cat << END
asdf
qwerty
END

# Here Strings (a simpler form of Here Documents)
cat <<< abc

echo "to stdout"
err "to stderr"

# disable buffer
# -oL means only buffer lines when writing to stdout
( echo "LINE 1" ; sleep 1 ; echo "LINE 2" ; ) | stdbuf -oL grep LINE | cat
```

## Function

```bash
function total_files {
  local name="$1"
  
  (( $? == 0 )) || return
  
  find $1 -type f | wc -l
  echo $0  # the name of the function
  echo $1 $2 $4
  echo $#  # number of args
  echo $@  # all args (expands to a separate word)
  echo $*  # all args (expands to a single word)
  echo $$  # the PID
}

total_files $input
```

A comprehensive list can be found [here](https://www.tldp.org/LDP/abs/html/special-chars.html).

- `$?` - Return code of the previous command
- `$$` - PID for the current script
- `!!` - Entire last command, including arguments. `sudo !!`
- `$_`, `!$` - Last argument from the last command. If you are in an interactive shell, you can also quickly get this value by typing Esc followed by `.`

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
[[ EXPRESSION ]]  ## preferred over [ ]
(( EXPRESSION ))  ## preferred over [[ ]]

[ 1 -ne 2 ]
echo $?  # => 0

# http://www.gnu.org/savannah-checkouts/gnu/bash/manual/bash.html#Bash-Conditional-Expressions
if [ ! -d "/home/$1" ]; then
```

## Control

```bash
last_line='NULL'
while read line; do
  if [[ -n "${line}" ]]; then
    last_line="${line}"
  fi
done < <(your_command)
# This will output the last non-empty line from your_command
echo "${last_line}"


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
while [ $a -lt 11 ]; do
        echo $a
        let a+=2
done

while getopts ":o:h" flag; do
    case "${flag}" in
        f) files="${OPTARG}" ;;
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

## Best Practices 

```bash
trap 'kill $(jobs -p)' EXIT
# Watch out to use single ', to prevent the shell from substituting the $() immediately.

trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT
# kill -- -$$ sends a SIGTERM to the whole process group, thus killing also descendants.

set -x  # print before execution
set -e  # die on error

# perl -n assume "while (<>) { ... }" loop around program
# perl -a autosplit mode with -n or -p (splits $_ into @F)
# perl -e evaluate
cat /tmp/sslparams.log | cut -d ' ' -f 2,2 | sort | uniq -c | sort -rn | perl -ane 'printf "%30s %s\n", $F[1], "="x$F[0];'

# tr -s " " Compress a series of identical characters (space here) to a single character
kill -9 $(ps aux | grep h2o | tr -s " " | cut -f 2 -d ' ')

# read: BASH builtin for retrieving data from standard input.
# read -r : Do not let backslash (\) act as an escape character
# read variable: Store data that you type from the keyboard
cat file.txt | sed '/^[[:space:]]*$/d' | while read -r a; do echo $a; done

cat a b | sort | uniq -d > c   # c is a intersect b
cat a b b | sort | uniq -u > c   # c is set difference a - b 

# DEFAULT_PATH=/usr/local/sbin:/usr/local/bin
for path in $(echo "$DEFAULT_PATH" | /bin/sed "s/:/\\n/g"); do

# set default value
[ -z "${MAX_CARNUM}" ] && MAX_CARNUM=18

# install tar
sudo tar xvf package.tar.xz --directory=/usr/local --strip-components=1

# prepend string
awk '{print "prefix " $0}'
sed -e "s/.*/prefix &/"

# Print the fifth and the second column
# Use space as delimiter by default
awk -F , '{print $5,$2}'
# or cut -d',' -f5,2

# sum 
awk ‘{ x += $3 } END { print x }’

# filter
awk '$3>10'

# -S buffer size
# -n numeric
# -k, --key=POS1[OPTS][,POS2]     start a key at POS1 (origin 1), end it at POS2
#                          (default end of line)
sort -S 4G -k1n,1 -k5n,5
```

Sed [Tutorial](https://www.grymoire.com/Unix/Sed.html):

```bash
# subsititution
sed s/day/night/

# use & as the matched string
$ echo "123 abc" | sed 's/[0-9]*/& &/' 
123 123 abc

# extended regex (-E / -r depends on the distribution)
# -n don't print the original lines
sed -rn '/([a-z]+) \1/p' # duplicated words

# command
/g # global
/I # ignore cases
/d # delete
/p # print

# script
#!/bin/sed -f
s/a/A/g
s/e/E/g
s/i/I/g
s/o/O/g
s/u/U/g
```

