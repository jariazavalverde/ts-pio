import { getLine, putStrLn } from "../src/pureio.ts";

// echo = getLine >>= putStrLn
const echo = getLine.bind(putStrLn);

// Run IO action
echo.runIO();