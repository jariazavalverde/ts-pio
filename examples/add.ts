import { forever, putStr, getLine, print, lift2 } from "../src/pio.ts";

const add = (x: number) => (y: number) => x+y;
const read = (x: string) => parseInt(x);

// getInt = putStr("Enter a number: ") >> fmap read getLine
const getInt = putStr("Enter a number: ").then(getLine.map(read));

// addIO = forever (liftA2 (+) getInt getInt >>= print)
const addIO = forever(lift2(add, getInt, getInt).bind(print));

// Run IO action
addIO.runIO();