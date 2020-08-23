import { IO, pure, filter, lift2, putStr, print, putStrLn, getLine } from "../src/pio.ts";

const cons = (x: number) => (xs: Array<number>) => [x].concat(xs);

const getInts: () => IO<Array<number>> = () =>
    putStrLn("Enter a number (enter to end):")
    .then(getLine)
    .bind((x: string) => x.trim() === "" ? pure([]) : lift2(cons, pure(parseInt(x)), getInts()))

const getBool: (x: number) => IO<boolean> = (x: number) =>
    putStr("Keep ")
    .then(putStr(x.toString()))
    .then(putStr("? (yes/no) "))
    .then(getLine.map((x: string) => x.trim() === "yes"));

const choose: IO<void> = getInts().bind(filter(getBool)).bind(print);

// Run IO action
choose.runIO();