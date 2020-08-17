import { forever, getLine, putStrLn } from "../src/pio.ts";

// echo = forever (getLine >>= putStrLn)
const echo = forever(getLine.bind(putStrLn));

// Run IO action
echo.runIO();