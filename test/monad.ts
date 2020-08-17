import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { pure } from "../src/pio.ts";

// Function composition.
const compose = function<A, B, C>(g: (y: B) => C, f: (x: A) => B): (x: A) => C {
    return x => g(f(x));
};

// Identity function.
const id = function<A>(x: A): A {
    return x;
};

// Functor laws for IO actions.
Deno.test("Functor laws for IO actions", () => {

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
    // fmap (f . g)  ==  fmap f . fmap g
    assertEquals(
        // fmap (f . g)
        pure(1).map(compose(g, f)).runIO(),
        // fmap f . fmap g
        pure(1).map(f).map(g).runIO()
    );

});