import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { IO, pure } from "../src/pio.ts";

// Type alias for Num a => IO (a -> a -> a).
type IOnum3 = IO<(g: (x: number) => number) => (f: (x: number) => number) => (x: number) => number>;

// Function composition.
const compose = function<B, C>(g: (y: B) => C): <A>(f: (x: A) => B) => (x: A) => C {
    return <A>(f: (x: A) => B) => (x: A) => g(f(x)); 
};

// Function application.
const apply = function<A>(x: A): <B>(f: (x: A) => B) => B {
    return <B>(f: (x: A) => B) => f(x);
};

// Identity function.
const id = function<A>(x: A): A {
    return x;
};

// Functor laws for IO actions.
Deno.test("Functor laws for IO actions", async () => {

    const f: (x: number) => number = x => x+1;
    const g: (x: number) => number = x => x*2;

    // Functors must preserve identity morphisms
    // fmap id == id
    assertEquals(
        // fmap id
        pure(1).map(id).runIO(),
        // id
        id(pure(1)).runIO()
    );

    // Functors must preserve composition of morphisms
    // fmap (g . f)  ==  fmap f . fmap g
    assertEquals(
        // fmap (g . f)
        await pure(1).map(compose(g)(f)).runIO(),
        // fmap f . fmap g
        await pure(1).map(f).map(g).runIO()
    );

});

// Applicative laws for IO actions.
Deno.test("Applicative laws for IO actions", async () => {

    const f: (x: number) => number = x => x+1;
    const g: (x: number) => number = x => x*2;
    const u: IO<(x: number) => number> = pure(f);
    const v: IO<(x: number) => number> = pure(g);
    const w: IO<number> = pure(1);
    const y:number = 1;
    
    // Identity
    // pure id <*> w = w
    assertEquals(
        // pure id <*> w
        await pure(id).ap(w).runIO(),
        // w
        await id(w).runIO()
    );

    // Homomorphism
    // pure f <*> pure y = pure (f y)
    assertEquals(
        // pure f <*> pure y
        await pure(f).ap(pure(y)).runIO(),
        // pure (f y)
        await pure(f(y)).runIO()
    );

    // Composition
    // pure (.) <*> u <*> v <*> w = u <*> (v <*> w)
    assertEquals(
        // pure (.) <*> u <*> v <*> w
        await (<IOnum3>pure(compose)).ap(u).ap(v).ap(w).runIO(),
        // u <*> (v <*> w)
        await u.ap(v.ap(w)).runIO()
    );

    // Interchange
    // u <*> pure y = pure ($ y) <*> u
    assertEquals(
        // u <*> pure y
        await u.ap(pure(y)).runIO(),
        // pure ($ y) <*> u
        await pure(apply(y)).ap(u).runIO()
    );

});