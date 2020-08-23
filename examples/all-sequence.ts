import { all, sequence, delay, print } from "../src/pio.ts";

const action = (x: number) => delay(10 * x + 2000).then(print(x));

// Array of actions
const actions = [action(1), action(2), action(3)];

// all vs sequence
const allActions = print("all").then(all(actions));
const seqActions = print("sequence").then(sequence(actions));

// Run IO action
allActions.then(seqActions).runIO();
