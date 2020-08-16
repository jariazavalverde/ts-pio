import { getLine, print } from "../src/pureio.ts";

// showLength = fmap length getLine >>= print
const length = (x: string) => x.length;
const showLength = getLine.map(length).bind(print);

// Run IO action
showLength.runIO();