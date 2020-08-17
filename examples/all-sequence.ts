import { all, sequence, delay, pure, print } from "../src/pio.ts";

// Array of actions
const actions = [
    delay(pure(1))(1000).bind(print),
    delay(pure(2))(1000).bind(print),
    delay(pure(3))(1000).bind(print)
];

// all vs sequence
const a = print("all").then(all(actions));
const b = print("sequence").then(sequence(actions));

// Run IO action
a.then(b).runIO();