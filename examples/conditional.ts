import { IO, getLine, putStr, putStrLn, when } from "../src/pio.ts";

// getBool = fmap (== "yes") getLine
const getBool: IO<boolean> = getLine.map((x: string) => x.trim() === "yes");

// cond = putStr "Enter yes/no: " >> getBool >>= flip when (putStrLn "done!")
const cond: IO<void> = putStr("Enter yes/no: ").then(
  getBool.bind(when(putStrLn("done!"))),
);

// Run IO action
cond.runIO();
