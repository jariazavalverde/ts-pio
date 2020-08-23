export interface IO<A> {
    runIO: () => Promise<A>;
    map: <A, B>(this: IO<A>, f: (x: A) => B) => IO<B>;
    ap: <A, B>(this: IO<(x: A) => B>, action: IO<A>) => IO<B>;
    bind: <A, B>(this: IO<A>, f: (x: A) => IO<B>) => IO<B>;
    then: <A, B>(this: IO<A>, action: IO<B>) => IO<B>;
    left: <A, B>(this: IO<A>, action: IO<B>) => IO<A>;
    catch: <A>(this: IO<A>, handler: (ex: any) => IO<A>) => IO<A>;
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
    return new IO(() => this.runIO().then(x => f(x)));
};

// Sequential application.
IO.prototype.ap = function<A, B>(this: IO<(x: A) => B>, action: IO<A>): IO<B> {
    return new IO(() => this.runIO().then(
        f => action.runIO().then(
            x => f(x)
        )
    ));
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

// Sequentially compose two IO actions, discarding any value produced by the
// second.
IO.prototype.left = function<A, B>(this: IO<A>, action: IO<B>): IO<A> {
    return new IO(() => this.runIO().then((x: A) => action.then(pure(x)).runIO()));
};

// Execute another IO action when the main action fails.
// IO internally uses promises to cope with asynchronous tasks, so the handler
// of the catch method is called when:
//    i) an exception is raised, or
//    ii) a promise is rejected.
IO.prototype.catch = function<A>(this: IO<A>, handler: (ex: any) => IO<A>): IO<A> {
    return new IO(() => {
        try {
            return this.runIO().catch(ex => handler(ex).runIO());
        } catch(ex) {
            return handler(ex).runIO();
        }
    });
};


// COMBINATORS

// Inject a value into an IO action.
export const pure = function<A>(x: A): IO<A> {
    return new IO(() => new Promise((resolve, _reject) => resolve(x)));
};

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

// Lift a binary function to IO actions.
export const lift2 = function<A, B, C>(fn: (x: A) => (y: B) => C, a: IO<A>, b: IO<B>): IO<C> {
    return pure(fn).ap(a).ap(b);
};


// CONDITIONAL EXECUTION

// Conditional failure of an IO action. 
export const guard = function(cond: boolean): IO<void> {
    return cond ? pure(undefined) : new IO<void>(
        () => new Promise((_resolve, _reject) => {
            throw "IO error";
        })
    );
};

// Conditional execution of an IO action.
export const when = function(action: IO<void>): (cond: boolean) => IO<void> {
    return cond => cond ? action : pure(undefined);
};

// The reverse of when.
export const unless = function(action: IO<void>): (cond: boolean) => IO<void> {
    return cond => cond ? pure(undefined) : action;
};


// EFFECTS

// Delay the given milliseconds. 
export const delay = function(ms: number): IO<void> {
    return new IO(() => new Promise(
        (resolve, _reject) => setTimeout(() => resolve(), ms)
    ));
};


// STANDARD INPUT/OUTPUT

// Write a string to the standard output device.
export const putStr = function(text: string): IO<void> {
    return ignore(
        new IO(() => Deno.stdout.write(new TextEncoder().encode(text)))
    );
};

// The same as putStr, but adds a newline character.
export const putStrLn = function(text: string): IO<void> {
    return ignore(
        new IO(() => Deno.stdout.write(new TextEncoder().encode(text + "\n")))
    );
};

// Output a value of any printable type to the standard output device.
// Printable types are those that implement a toString method.
// The print function converts values to strings for output and adds a newline.
export const print = function(value: Show): IO<void> {
    return putStrLn(value.toString());
};

// Read a character from the standard input device.
// This makes use of Deno.setRaw which is still unstable so the library
// requires the --unstable flag to run.
export const getChar = new IO<string>(() => {
    const buffer = new Uint8Array(1);
    Deno.setRaw(0, true);
    return Deno.stdin.read(buffer).then(
        (n: number | null) => n ? new TextDecoder().decode(buffer.subarray(0, 1)) : ""
    ).finally(
        () => Deno.setRaw(0, false)
    );
});

// Read a line from the standard input device.
export const getLine = new IO<string>(() => {
    const buffer = new Uint8Array(1024);
    return Deno.stdin.read(buffer).then(
        (n: number | null) => n ? new TextDecoder().decode(buffer.subarray(0, n)) : ""
    );
});


// FILES

// Read a file and return the contents of the file as a string.
export const readFile = function(path: string): IO<string> {
    return new IO(() => Deno.readFile(path).then(
        (content: BufferSource) => new TextDecoder('utf-8').decode(content)
    ));
};

// Write the string to the file.
export const writeFile = function(path: string): (content: string) => IO<void> {
    return (content: string) =>
        new IO(() => Deno.writeFile(path, new TextEncoder().encode(content), {append: false}));
}

// Append the string to the file.
export const appendFile = function(path: string): (content: string) => IO<void> {
    return (content: string) =>
        new IO(() => Deno.writeFile(path, new TextEncoder().encode(content), {append: true}));
};