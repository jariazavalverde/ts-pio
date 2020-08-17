# pio.ts

## A monadic library for I/O actions in TypeScript

**pio.ts** allows you to handle all impure actions of your program, such as reading from standard input or writing to files, as a sequence of (pure) composable actions in a functional way.

```ts
import { forever, getLine, putStrLn } from "../path/to/pio.ts";

// echo = forever (getLine >>= putStrLn)
const echo = forever(getLine.bind(putStrLn));

// Run IO action
echo.runIO();
```

## Downloads

Source code of pio.ts is available on [GitHub](src). 

## License

pio.ts source code is released under the terms of the [BSD 3-Clause License](LICENSE).

## Documentation

* [IO prototype](#IO-prototype)
* [Combinators](#Combinators)
* [Effects](#Effects)
* [Write to standard output](#Write-to-standard-output)
* [Read from standard input](#Read-from-standard-input)

### IO prototype

#### IO.prototype.map

Map the result of an IO action.

```ts
function<A, B>(this: IO<A>, f: (x: A) => B): IO<B>
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

### Combinators

#### pure
Inject a value into a IO action.

```ts
function<A>(x: A): IO<A>
```

#### all

Evaluate each IO action in the array in a non-blocking way, and collect the results.

```ts
function<A>(xs: Array<IO<A>>): IO<Array<A>>
```

#### sequence

Evaluate each IO action in the array from left to right, and collect the results.

```ts
function<A>(xs: Array<IO<A>>): IO<Array<A>>
```

#### forever

Repeat an action indefinitely.

```ts
function<A>(action: IO<A>): IO<A>
```

#### ignore

Ignore the result of evaluation.

```ts
function<A>(action: IO<A>): IO<void>
```

### Effects

#### delay

Evaluate an IO action after a time (in milliseconds).

```ts
function<A>(action: IO<A>): (ms: number) => IO<A>
```

### Write to standard output

#### putStr

Write a string to the standard output device.
```ts
function(text: string): IO<number>
```

#### putStrLn

The same as `putStr`, but adds a newline character.

```ts
function(text: string): IO<number>
```

#### print

Output a value of any printable type to the standard output device. Printable types are those that implement a `toString` method. The print function converts values to strings for output and adds a newline.

```ts
function(value: Show): IO<number>
```

### Read from standard input

#### getLine

Read a line from the standard input device.

```ts
IO<string>
```