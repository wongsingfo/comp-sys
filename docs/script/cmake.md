---
layout: default
title: CMake in 30 Minutes
parent: Script
nav_order: 5
---

# CMake in 30 Minutes
{: .no_toc }

## References
{: .no_toc .text-delta }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## gnu make

```makefile
MAKEFILE=Makefile

.PHONY: all clean test
%.o: %.cpp
	$(CC) $(CFLAGS) -c $< -o $@

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

depend_%:
	$(CC) $(CFLAGS) -MM -MT \
	      '$(subst depend_,,$@).o' $(subst depend_,,$@).c >> $(MAKEFILE).new
depend: dependinit \
        $(addprefix depend_,$(basename $(DEPEND_SRCS)))
	mv ${MAKEFILE}.new ${MAKEFILE}
dependinit:
	sed -e '/^#START DEPS/,$$d' ${MAKEFILE} > ${MAKEFILE}.new
	echo '#START DEPS - Do not change this line or anything after it.' >> \
	     ${MAKEFILE}.new
```

## CMake

```cmake
cmake_minimum_required(VERSION 3.14)
project(chromium)
set(CMAKE_CXX_STANDARD 14)

add_executable(cmake_testapp   # target: cmake_testapp
	main.cpp
	hello.h
	hello.cpp)
add_executable(cmake_testapp_calc # another target
  calc.cpp)
add_library (test_library STATIC calc.cpp)

include_directories(includes/general) # for all target
target_include_directories (cmake_testapp_calc PUBLIC includes/math) # for cmake_testapp_calc only

find_library(TEST_LIBRARY test_library PATH lib)
target_link_libraries(cmake_testapp_calc LINK_PUBLIC ${TEST_LIBRARY})

find_package(OpenSSL )
# If we write find_package(my_library ...), it will go and look for a file named my_library-config.cmake (among others) in a directory named my_library* under the ${CMAKE_INSTALL_PREFIX}/lib (among many others).
message("root: ${OPENSSL_ROOT_DIR}")
message("OpenSSL_VERSION: ${OPENSSL_VERSION}")
message("OpenSSL_INCLUDE_DIR: ${OPENSSL_INCLUDE_DIR}")
message("OpenSSL_LIBRARIES: ${OPENSSL_LIBRARIES}")
include_directories(${OPENSSL_INCLUDE_DIR})

add_subdirectory(test) 

# get all project files for formatting
file(GLOB_RECURSE CLANG_FORMAT_SOURCE_FILES *.c *.h)
# Adds clangformat as target that formats all source files
add_custom_target(
    clangformat
    COMMAND clang-format
    -style=Webkit
    -i
    ${CLANG_FORMAT_SOURCE_FILES}
)

install(TARGETS test DESTINATION lib)
install(FILES test.h DESTINATION include)
```

```bash
cmake -DCMAKE_BUILD_TYPE=Release
-DCMAKE_FIND_DEBUG_MODE=ON  # for debug `find_package`
```

### $ Tricks

`$` means substitution

```cmake
set(JOHN_NAME "John Smith")
set(JOHN_ADDRESS "123 Fake St")
set(PERSON "JOHN")
message("${${PERSON}_NAME} lives at ${${PERSON}_ADDRESS}.")
set(${PERSON}_NAME "John Goodman")
```

### Flow Control

```cmake
if(WIN32)
    message("You're running CMake on Windows.")
endif()

set(A "1")
set(B "1")
while(A LESS "1000000")
    message("${A}")                 # Print A
    math(EXPR T "${A} + ${B}")      # Add the numeric values of A and B; store result in T
    set(A "${B}")                   # Assign the value of B to A
    set(B "${T}")                   # Assign the value of T to B
endwhile()
```

### List

Lists are Just Semicolon-Delimited Strings!

```cmake
set(ARGS "EXPR;T;1 + 1")
# unquoted arguments: expand the string into a list by semicolons
math(${ARGS})
# quoted arguments: don't expand
message("${ARGS}")

# strings are joned by semicolons
set(MY_LIST These are separate arguments)
message("${MY_LIST}")       # Prints: These;are;separate;arguments

list(REMOVE_ITEM MY_LIST "separate")
list(TRANSFORM MY_LIST PREPEND "prefix_")

foreach(ARG These are separate arguments)
# or, foreach(ARG ${MY_LIST}) 
    message("${ARG}")   # Prints each word on a separate line
endforeach()
```

### function

Functions Run In Their Own Scope; Macros Don't

```cmake
function(doubleIt VARNAME VALUE)
    math(EXPR RESULT "${VALUE} * 2")
    set(${VARNAME} "${RESULT}" PARENT_SCOPE)    
    # Set the named variable in caller's scope (use PARENT_SCOPE here!)
endfunction()

macro(doubleIt VARNAME VALUE)
    math(EXPR ${VARNAME} "${VALUE} * 2")       
    # Set the named variable in caller's scope
endmacro()

doubleIt(RESULT "4")   # Tell the function to set the variable named RESULT
message("${RESULT}")      
```

### Including

`find_package()` looks for scripts of the form `Find*.cmake`, then call `include()` to include these scripts. It runs in the same scope.

`add_subdirectory()` creates a new scope, then executes the script `CMakeLists.txt` from the specified directory.

## Target

- visible in every scope, even in a subdirectory. 
- each target has properties
- `add_executable`, `add_library`, `add_custom_target` create a target and set its properties for us
- `target_link_libraries`, `target_include_directories`, `target_compile_definitions` can set properties
- `get_property(MYAPP_SOURCES TARGET MyApp PROPERTY SOURCES)`, set MYAPP_SOURCES to MyApp source codes

## Examples

```cmake
# get all project files for formatting
file(GLOB_RECURSE CLANG_FORMAT_SOURCE_FILES *.c *.h)

# Adds clangformat as target that formats all source files
add_custom_target(
    clangformat
    COMMAND clang-format
    -style=Webkit
    -i
    ${CLANG_FORMAT_SOURCE_FILES}
)
```

```cmake
target_compile_options(hwvideo PRIVATE
        -Wall -Wextra -pedantic -Werror 
        -Wno-unused-variable
        -Wno-unused-parameter
        -Wno-sign-compare
        -Wno-missing-field-initializers)
```

```cmake
add_custom_command(
        OUTPUT ${mperf_bin}
        COMMAND make ${mperf_make}
        WORKING_DIRECTORY ${mperf_dir}
)

add_custom_target(
        mperf
        ALL
        DEPENDS ${mperf_bin} tcpstack
)
```

