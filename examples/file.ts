import { getLine, print, readFile, appendFile } from "../src/pio.ts";

const file = (path: string) =>
  print("Enter file content: ")
    .then(getLine).bind(appendFile(path))
    .then(readFile(path)).bind(print)
    .catch(print);

// Run IO action
file("pio.txt").runIO();
