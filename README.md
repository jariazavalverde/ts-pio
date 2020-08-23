[![license](https://img.shields.io/github/license/jariazavalverde/ts-pio)](https://github.com/jariazavalverde/ts-pio/blob/master/LICENSE)
[![version](https://img.shields.io/github/v/tag/jariazavalverde/ts-pio?label=version)](https://github.com/jariazavalverde/ts-pio)

# pio.ts

## A monadic library for I/O actions in TypeScript

[pio.ts](https://github.com/jariazavalverde/ts-pio) allows you to handle all impure actions of your program, such as reading from standard input or writing to files, as a sequence of (pure) composable actions in a functional way.

```ts
import { forever, getLine, putStrLn } from "https://deno.land/x/pio/pio.ts";

// echo = forever (getLine >>= putStrLn)
const echo = forever(getLine.bind(putStrLn));

// Run IO action
echo.runIO();
```

**Note:** *Some IO actions defined by [pio.ts](https://github.com/jariazavalverde/ts-pio) (like [getChar](#getChar)) make use of `Deno.setRaw` which is still unstable, so the library requires the `--unstable` flag to run.*

## Downloads

Source code of [pio.ts](https://github.com/jariazavalverde/ts-pio) is available on [GitHub](src). You can import the most recent version released from:

```
https://deno.land/x/pio@v1.0.0/pio.ts
```

## License

[pio.ts](https://github.com/jariazavalverde/ts-pio) source code is released under the terms of the [BSD 3-Clause License](LICENSE).

## Documentation

* [IO prototype](#IO-prototype)
* [Combinators](#Combinators)
* [Lifting operators](#Lifting-operators)
* [Conditional execution](#Conditional-execution)
* [Effects](#Effects)
* [Standard input/output](#Standard-inputoutput)
* [Files](#Files)

---

### IO prototype

#### IO.prototype.map

Map the result of an IO action.

```ts
function<A, B>(this: IO<A>, f: (x: A) => B): IO<B>
```

#### IO.prototype.ap

Sequential application.

```ts
function<A, B>(this: IO<(x: A) => B>, action: IO<A>): IO<B>
```

#### IO.prototype.bind

Sequentially compose two IO actions, passing any value produced by the first as an argument to the second.

```ts
function<A, B>(this: IO<A>, f: (x: A) => IO<B>): IO<B>
```

#### IO.prototype.then

Sequentially compose two IO actions, discarding any value produced by the first.

```ts
function<A, B>(this: IO<A>, action: IO<B>): IO<B>
```

#### IO.prototype.left

Sequentially compose two IO actions, discarding any value produced by the second.

```ts
function<A, B>(this: IO<A>, action: IO<B>): IO<A>
```

#### IO.prototype.catch

Execute another IO action when the main action fails. `IO` internally uses promises to cope with asynchronous tasks, so the handler of the `catch` method is called when: i) an exception is raised, or ii) a promise is rejected.

*Example: [file.ts](examples/file.ts)*

```ts
function<A>(this: IO<A>, handler: (ex: any) => IO<A>): IO<A>
```

#### IO.prototype.void

Ignore the result of evaluation.

```ts
function<A>(this: IO<A>): IO<void>
```

---

### Combinators

#### pure
Inject a value into an IO action.

```ts
function<A>(x: A): IO<A>
```

#### all

Evaluate each IO action in the array in a non-blocking way, and collect the results.

*Example: [all-sequence.ts](examples/all-sequence.ts)*

```ts
function<A>(xs: Array<IO<A>>): IO<Array<A>>
```

#### sequence

Evaluate each IO action in the array from left to right, and collect the results.

*Example: [all-sequence.ts](examples/all-sequence.ts)*

```ts
function<A>(xs: Array<IO<A>>): IO<Array<A>>
```

#### replicate

Perform the action n times, gathering the results.

*Example: [replicate.ts](examples/replicate.ts)*

```ts
function<A>(action: IO<A>): (n: number) => IO<Array<A>>
```

#### forever

Repeat an action indefinitely.

*Example: [echo.ts](examples/echo.ts)*

```ts
function<A>(action: IO<A>): IO<A>
```

#### filter

Array-based filter function for IO actions.

*Example: [filter.ts](examples/filter.ts)*

```ts
function<A>(predicate: (x: A) => IO<boolean>): (xs: Array<A>) => IO<Array<A>>
```

---

### Lifting operators

#### lift2

Lift a binary function to IO actions.

*Example: [add.ts](examples/add.ts)*

```ts
function<A, B, C>(fn: (x: A) => (y: B) => C, a: IO<A>, b: IO<B>): IO<C>
```

#### lift3

Lift a ternary function to IO actions.

```ts
function<A, B, C, D>(fn: (x: A) => (y: B) => (z: C) => D, a: IO<A>, b: IO<B>, c: IO<C>): IO<D>
```

---

### Conditional execution

#### guard

Conditional failure of an IO action. 

```ts
function(cond: boolean): IO<void>
```

#### when

Conditional execution of an IO action.

*Example: [conditional.ts](examples/conditional.ts)*

```ts
function(action: IO<void>): (cond: boolean) => IO<void>
```

#### unless

The reverse of [when](#when).

```ts
function(action: IO<void>): (cond: boolean) => IO<void>
```

---

### Effects

#### delay

Delay the given milliseconds.

*Example: [all-sequence.ts](examples/all-sequence.ts)*

```ts
function(ms: number): IO<void>
```

---

### Standard input/output

#### putStr

Write a string to the standard output device.
```ts
function(text: string): IO<void>
```

#### putStrLn

The same as [putStr](#putStr), but adds a newline character.

```ts
function(text: string): IO<void>
```

#### print

Output a value of any printable type to the standard output device. Printable types are those that implement a `toString` method. The print function converts values to strings for output and adds a newline.

```ts
function(value: Show): IO<void>
```

#### getChar

Read a character from the standard input device. This makes use of `Deno.setRaw` which is still unstable so the library requires the `--unstable` flag to run.

*Example: [password.ts](examples/password.ts)*

```ts
IO<string>
```

#### getLine

Read a line from the standard input device.

```ts
IO<string>
```

---

### Files

#### readFile

Read a file and return the contents of the file as a string.

*Example: [file.ts](examples/file.ts)*

```ts
function(path: string): IO<string>
```

#### writeFile

Write the string to the file.

*Example: [file.ts](examples/file.ts)*

```ts
function(path: string): (content: string) => IO<void>
```

#### appendFile

Append the string to the file.

*Example: [file.ts](examples/file.ts)*

```ts
function(path: string): (content: string) => IO<void>
```