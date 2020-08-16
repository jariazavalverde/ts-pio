export interface IO<A> {
    runIO: () => Promise<A>;
    map: <A, B>(this: IO<A>, f: (x: A) => B) => IO<B>;
    bind: <A, B>(this: IO<A>, f: (x: A) => IO<B>) => IO<B>;
    then: <A, B>(this: IO<A>, io: IO<B>) => IO<B>;
};

export interface Show {
    toString: () => string;
};

export const IO = function<A>(this: IO<A>, runIO: () => Promise<A>) {
    this.runIO = runIO;
} as any as {
    new <A>(runIO: () => Promise<A>): IO<A>;
};


// MONADIC INTERFACE

// Map the result of an IO action.
IO.prototype.map = function<A, B>(this: IO<A>, f: (x: A) => B): IO<B> {
    return new IO(() => this.runIO().then((x: A) => f(x)));
};

// Sequentially compose two IO actions, passing any value produced by the first
// as an argument to the second.
IO.prototype.bind = function<A, B>(this: IO<A>, f: (x: A) => IO<B>): IO<B> {
    return new IO(() => this.runIO().then((x: A) => f(x).runIO()));
};

// Sequentially compose two IO actions, discarding any value produced by the
// first.
IO.prototype.then = function<A, B>(this: IO<A>, io: IO<B>): IO<B> {
    return new IO(() => this.runIO().then((_x: A) => io.runIO()));
};

// Inject a value into a IO action.
export const pure = function<A>(x: A): IO<A> {
    return new IO(() => new Promise((resolve, _reject) => resolve(x)));
};


// WRITE TO STANDARD OUTPUT

// Write a string to the standard output device.
export const putStr = function(text: string): IO<number> {
    return new IO(() => Deno.stdout.write(new TextEncoder().encode(text)));
};

// The same as putStr, but adds a newline character.
export const putStrLn = function(text: string): IO<number> {
    return new IO(() => Deno.stdout.write(new TextEncoder().encode(text + "\n")));
};

// The print function outputs a value of any printable type to the standard
// output device. Printable types are those that implement a toString method.
// The print function converts values to strings for output and adds a newline.
export const print = function(value: Show): IO<number> {
    return putStrLn(value.toString());
};


// READ FROM STANDARD INPUT

// Read a line from the standard input device.
export const getLine = new IO<string>(() => {
    const buf = new Uint8Array(1024);
    return Deno.stdin.read(buf).then(
        (n: number | null) => n ? new TextDecoder().decode(buf.subarray(0, n)).trim() : ""
    );
});