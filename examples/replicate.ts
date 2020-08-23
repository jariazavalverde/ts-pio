import { putStr, replicate, getLine, print } from "../src/pio.ts";

const read = (x: string) => parseInt(x);

const getInt = putStr("Enter a number: ").then(getLine.map(read));

const rep = putStr("How many times? ")
    .then(getLine.map(read))
    .bind(replicate(getInt))
    .bind(print)

// Run IO action
rep.runIO();