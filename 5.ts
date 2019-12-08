import { assertEqual } from "./assert";
import { execIntcode, createStream } from "./intcode";
import { getInput, getOldInput } from "./5.in";

assertEqual(execIntcode([1, 0, 0, 0, 99]).memory, [2, 0, 0, 0, 99]);
assertEqual(execIntcode([2, 3, 0, 3, 99]).memory, [2, 3, 0, 6, 99]);
assertEqual(execIntcode([2, 4, 4, 5, 99, 0]).memory, [2, 4, 4, 5, 99, 9801]);
assertEqual(execIntcode([1, 1, 1, 4, 99, 5, 6, 0, 99]).memory, [
  30,
  1,
  1,
  4,
  2,
  5,
  6,
  0,
  99
]);

function prepareAndRun(program, noun, verb) {
  const actualProgram = [...program];
  actualProgram[1] = noun;
  actualProgram[2] = verb;
  return execIntcode(actualProgram).memory[0];
}

assertEqual(prepareAndRun(getOldInput(), 12, 2), 3101844);
assertEqual(prepareAndRun(getOldInput(), 84, 78), 19690720);

assertEqual(
  execIntcode(getInput(), createStream([1])).stdout.next({ command: "flush" })
    .value,
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 14155342]
);

assertEqual(
  execIntcode(getInput(), createStream([5])).stdout.next({ command: "flush" })
    .value,
  [8684145]
);
