---
layout: default
title: Python in 30 Minutes
parent: Programming Language
nav_order: 80
---

# Python in 30 Minutes
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Decorators

Basically, `@d c` is equivalent to `c = d([the body of c])`.

```py
import functools

def do_twice(func):
	@functools.wraps(func)
    def wrapper_do_twice(*args, **kwargs):
        func(*args, **kwargs)
        return func(*args, **kwargs)
    return wrapper_do_twice
```

With/without arguments:

```py
def repeat(_func=None, *, num_times=2):
    def decorator_repeat(func):
        @functools.wraps(func)
        def wrapper_repeat(*args, **kwargs):
            for _ in range(num_times):
                value = func(*args, **kwargs)
            return value
        return wrapper_repeat

    if _func is None:
        return decorator_repeat
    else:
        return decorator_repeat(_func)

@repeat(num_times=4)
def greet(name):
    print(f"Hello {name}")
@repeat
def greet(name):
    print(f"Hello {name}")
```

As class:
```py
import functools

class CountCalls:
    def __init__(self, func):
        functools.update_wrapper(self, func)
        self.func = func
        self.num_calls = 0

    def __call__(self, *args, **kwargs):
        self.num_calls += 1
        print(f"Call {self.num_calls} of {self.func.__name__!r}")
        return self.func(*args, **kwargs)

@CountCalls
def say_whee():
    print("Whee!")
```

Some useful decorators:

```py
from decorators import debug, timer
```

```py
def singleton(cls):
    """Make a class a Singleton class (only one instance)"""
    @functools.wraps(cls)
    def wrapper_singleton(*args, **kwargs):
        if not wrapper_singleton.instance:
            wrapper_singleton.instance = cls(*args, **kwargs)
        return wrapper_singleton.instance
    wrapper_singleton.instance = None
    return wrapper_singleton

@singleton
class TheOne:
    pass
```

```py
# without cache: https://docs.python.org/3/library/functions.html#property

# with cache:
# how it works: https://stackoverflow.com/questions/24704147/python-what-is-a-lazy-property
## 1. resolves foo.bar. No bar attribute is found on the instance.
## 2. finds the bar descriptor on the class, and calls __get__ on that.
## 3. The cached_property __get__ method takes the return value and sets
##### a new attribute bar on the instance; foo.bar = 'spam'.
class LazyProperty(object):
    def __init__(self, func):
        self.func = func

    def __get__(self, instance, owner):
        if instance is None:
            return self
        else:
            value = self.func(instance)
            setattr(instance, self.func.__name__, value)
            return value
```

## Descriptor

- [discussion on stackoverflow](https://stackoverflow.com/questions/3798835/understanding-get-and-set-and-python-descriptors)

A descriptor is defined on a class, but is typically called from an instance. 

```py
class Celsius(object):
    def __init__(self, value=0.0):
        self.value = float(value)
    def __get__(self, instance, owner): 
    	# instance can be None when Temperature.celsius is accessed
    	
    	# why only __get__ has owner?
    	# because others can get owner by instance
        return self.value
    def __set__(self, instance, value):
        self.value = float(value)
    def __delete__(self, instance):
    	pass

class Temperature(object):
    celsius = Celsius()
```

## Doc String

```py
"""
A class used to represent an Animal

...

Attributes
----------
says_str : str
    a formatted string to print out what the animal says
name : str
    the name of the animal
sound : str
    the sound that the animal makes
num_legs : int
    the number of legs the animal has (default 4)

Methods
-------
says(sound=None)
    Prints the animals name and what sound it makes
"""
```

```py
"""Prints what the animals name is and what sound it makes.

If the argument `sound` isn't passed in, the default Animal
sound is used.

Parameters
----------
sound : str, optional
    The sound the animal makes (default is None)

Raises
------
NotImplementedError
    If no sound is set for the animal or passed in as a
    parameter.

Returns
-------
list
    a list of strings used that are the header columns
"""
```

## With context managers

```py
class controlled_execution:
    def __enter__(self):
        # set things up
        return thing
    def __exit__(self, type, value, traceback):
    	""" The parameters describe the exception that caused 
    	the context to be exited. If the context was exited 
    	without an exception, all three arguments will be None.
    	"""
        # tear things down
        return True # suppress the exception

with controlled_execution() as thing:
     some code
```

## Iterator

To get an iterator, the `__iter__` method is called on the iterable. This is like a factory method that returns a new iterator for this specific iterable. A type having a `__iter__` method defined, turns it into an iterable.

The iterator generally needs a single method, `__next__`, which returns the next item for the iteration. In addition, to make the protocol easier to use, every iterator should also be an iterable, returning itself in the `__iter__` method.

```py
class ListIterator:
    def __init__ (self, lst):
        self.lst = lst
        self.idx = 0

    def __iter__ (self):
        return self

    def __next__ (self):
        try:
            item = self.lst[self.idx]
        except IndexError:
            raise StopIteration()
        self.idx += 1
        return item
```


