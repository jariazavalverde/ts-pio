export interface IO<A> {
    runIO: () => Promise<A>;
    map: <A, B>(this: IO<A>, f: (x: A) => B) => IO<B>;
    bind: <A, B>(this: IO<A>, f: (x: A) => IO<B>) => IO<B>;
    then: <A, B>(this: IO<A>, action: IO<B>) => IO<B>;
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
    return new IO(() => this.runIO().then(x => f(x).runIO()));
};

// Sequentially compose two IO actions, discarding any value produced by the
// first.
IO.prototype.then = function<A, B>(this: IO<A>, action: IO<B>): IO<B> {
    return new IO(() => this.runIO().then((_x: A) => action.runIO()));
};

// Inject a value into a IO action.
export const pure = function<A>(x: A): IO<A> {
    return new IO(() => new Promise((resolve, _reject) => resolve(x)));
};


// COMBINATORS

// Evaluate each IO action in the array in a non-blocking way, and collect the
// results.
export const all = function<A>(xs: Array<IO<A>>): IO<Array<A>> {
    const actions = xs.slice();
    return new IO(() => {
        const promises: Array<Promise<A>> = [];
        for(let i = 0; i < actions.length; i++) {
            promises.push(actions[i].runIO());
        }
        return Promise.all(promises);
    });
};

// Evaluate each IO action in the array from left to right, and collect the
// results.
export const sequence = function<A>(xs: Array<IO<A>>): IO<Array<A>> {
    const actions = xs.slice();
    return new IO(() => {
        const results: Array<A> = [];
        if(actions.length == 0)
            return pure(results).runIO();
        let action = actions[0];
        for(let i = 1; i < actions.length; i++) {
            action = action.bind(x => {
                results.push(x);
                return actions[i];
            });
        }
        return action.bind(x => {
            results.push(x);
            return pure(results);
        }).runIO();
    });
};

// Repeat an action indefinitely.
export const forever = function<A>(action: IO<A>): IO<A> {
    return new IO(() => action.runIO().then(_x => forever(action).runIO()));
};

// Ignore the result of evaluation.
export const ignore = function<A>(action: IO<A>): IO<void> {
    return action.map(_x => {});
};


// EFFECTS

// Evaluate an IO action after a time.
export const delay = function<A>(action: IO<A>): (ms: number) => IO<A> {
    return (ms: number) => new IO(() => new Promise(
        (resolve, _reject) => setTimeout(() => action.runIO().then(resolve), ms)
    ));
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

// Output a value of any printable type to the standard output device.
// Printable types are those that implement a toString method.
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