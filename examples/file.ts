import { getLine, print, readFile, writeFile } from "../src/pio.ts";

const file = (path: string) =>
    print("Enter file content: ")
        .then(getLine).bind(writeFile(path))
        .then(readFile(path)).bind(print)

// Run IO action
file("pio.txt").runIO();