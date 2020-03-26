---
layout: default
title: Lua in 30 Minutes
parent: Programming Language
nav_order: 80
---

# Lua in 30 Minutes
{: .no_toc }

Lua: an *embedded language*

## References
{: .no_toc .text-delta }

- Programming in Lua, fourth Edition
- [Learning X in Y minutes](https://learnxinyminutes.com/docs/lua/)

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

```lua
arg

--[[
Comments
--]]

"result is " .. 3 --> result is 3
5 .. 6            --> 56
tonumber("123")   --> 123
{1, 2, 3}         --> {1: 1, 2:2, 3:3}

zip = company?.director?.address?.zipcode 
--> a?.b    if a == nil return nil else return a.b

if ... then ... elseif ... then ... else ... end
while ... do ... end
repeat ... until ...
for var = from, to, step ... end
do end -- a block

::label:: 
goto label

if not n then error("invalid input") end
assert(io.read("*n"), "invalid input")

local status, err = pcall(function () error({code=121}) end)
-- xpcall debug.traceback
```

## Data Representation

integer: `i64` (`i32` on Small Lua)

```lua
if not tonumber(x) then --> x is not a number?
```

float: `f64` (`f32` on Small Lua)

Table: 

- a mapping from keys to values
- `a.x` = `a["x"]`
- `#a` return the smallest `i` such that `i >= 0` and `a[i] == nil`. This can get the length of an "array".

````lua
for v in t do
for k, v in pairs(t) do    --> k ranges over the keys
for i, v in ipairs(t) do   --> k ranges form 1 to #t    
````

function:

- Lua does tail-call elimination

```lua
function foo2 () 
  local mi = 1
  return "a", "b" 
end
x,y,z = foo2()   -- x="a", y="b", z=nil

function add (...)
	local s = 0
	for _, v in ipairs{...} do
		s=s+ v 
  end
	return s 
end

function tablename.fn(f1, f2) 
  -- tablename.fn = function(f1, f2)
function tablename:fn(f1)
  -- function tablename.fn(self, f1)
```

## Libraries

```lua
local inspect = require('inspect')
print(inspect({1,2,3})) -- {1, 2, 3}

string.format("mail -s '%s' '%s'", subject, address)

math.sin(math.pi / 2)
t = {10, 20}
table.insert(t, 1, 15)  --> t = {15, 10, 20}
table.remove(t, 2)      --> t = {15, 20}
table.insert(t, x)   --> table.insert(t, #t + 1, x)
table.remove(t)      --> table.remove(t, #t)
table.sort(network, function (a,b) return (a.name > b.name) end)
a,b = table.unpack{10,20,30} -- a=10, b=20, 30 is discarded

s, e = string.find("hello Lua users", "Lua")   --> 7 9
string.match("Today is 17/7/1990", "%d+/%d+/%d+")  --> 17/7/1990

io.write(string.format("sin(3) = %.4f\n", math.sin(3)))
t = io.read("a")  --[[
 "a": read the whole file
 "l": readline (dropping the newline)
 "L": readline (keeping the newline)
 "n": read a number
 num: read `num` characters
--]]
io.lines(filename, "*L") --> a function, at each call, returns a new line from the given file. 
for line in io.lines() do
  
file, err = io.open("non-existent-file", "r")
file:seek("end")
file:seek("set", current)
io.stderr:write(message)
  
local f = io.popen("ls", "r")
for entry in f:lines() do

os.time()  --> 1439653520
```

## Compliation

```lua
f = load("i = i + 1")
--> f = function () i = i + 1 end
function dofile (filename)
  local f = assert(loadfile(filename))
  return f()
end
```

```shell
luac -o prog.lc prog.lua
luac -l prog.lc
```

We can write a minimal `luac` directly in Lua:

```lua
p = loadfile(arg[1])
f = io.open(arg[2], "wb") 
f:write(string.dump(p)) f:close()
```

## Object-Oriented

Objects are not primitive in Lua.

```lua
setmetatable(A, {__index = B, __add = .... })  
-- __pow(a, b)                     for a ^ b
-- __unm(a)                        for -a
-- __concat(a, b)                  for a .. b
-- __len(a)                        for #a
-- __eq(a, b)                      for a == b
-- __lt(a, b)                      for a < b
-- __le(a, b)                      for a <= b
-- __index(a, b)  <fn or a table>  for a.b
-- __newindex(a, b, c)             for a.b = c
-- __call(a, ...)                  for a(...)


function tablename.fn(f1, f2) 
  -- tablename.fn = function(f1, f2)
function tablename:fn(f1)
  -- function tablename.fn(self, f1)
    
Dog = {}

function Dog:new()    
  newObj = {sound = 'woof'}  
  self.__index = self    
  return setmetatable(newObj, self) 
end

function Dog:makeSound() 
  print('I say ' .. self.sound)
end
    
mrDog = Dog:new()
mrDog:makeSound()
    
LoudDog = Dog:new()  

function LoudDog:makeSound()
  s = self.sound .. ' '  
  print(s .. s .. s)
end

seymour = LoudDog:new()  -- Inheritance
seymour:makeSound()  -- 'woof woof woof'
    
-- If needed, a subclass's new() is like the base's:
function LoudDog:new()
  newObj = {}
  -- set up newObj
  self.__index = self
  return setmetatable(newObj, self)
end
```

## Module

A module is fundamentally a table.

```lua
local M = {}

local function sayMyName()
  print('Hrunkner')
end

function M.sayHello()
  print('Why hello there')
  sayMyName()
end

return M
```

```lua
local mod = require('mod')

-- Suppose mod2.lua contains "print('Hi!')".
local a = require('mod2')  -- Prints Hi!
local b = require('mod2')  -- Doesn't print; a=b.

-- dofile is like require without caching:
dofile('mod2.lua')  --> Hi!
dofile('mod2.lua')  --> Hi! (runs it again)

-- loadfile loads a lua file but doesn't run it yet.
f = loadfile('mod2.lua')  -- Call f() to run it.

-- loadstring is loadfile for strings.
g = loadstring('print(343)')  -- Returns a function.
g()  -- Prints out 343; nothing printed before now.
```

## C API

The API emphasizes flexibility and simplicity, sometimes at the cost of ease of use. It is our responsibility to make sure that the arguments are valid before calling a function. 

All data exchange from Lua to C and from C to Lua occurs through a virtual stack. 

```c
void lua_pushboolean (lua_State *L, int bool);
// The first element pushed on the stack has index 1
// The last has index -1
int lua_isboolean (lua_State *L, int index);
int lua_toboolean (lua_State *L, int index);
int lua_gettop(lua_State *L); /* depth of the stack */

/* do the call (2 arguments, 1 result) */
if (lua_pcall(L, 2, 1, 0) != LUA_OK)
  error(L, "error running function 'f': %s", lua_tostring(L, -1));
```

