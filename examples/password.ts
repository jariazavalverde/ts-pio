import { IO, putStr, putStrLn, getChar, pure, lift2 } from "../src/pio.ts";

const cat = (x: string) => (y: string) => x+y;

// Get a password from stdin
const password: () => IO<string> = () =>
    getChar.bind(x => x.codePointAt(0) == 13
        ? putStr("\n").then(pure(""))
        : putStr("*").then(lift2(cat, pure(x), password())));

// Ask for a password
const askPassword = putStr("Enter a password: ")
    .then(password())
    .left(putStr("Your password is: "))
    .bind(putStrLn);

// Run IO action
askPassword.runIO();