import { assertEqual } from "./assert";
import { execIntcode } from "./intcode";
import { getInput, getOldInput } from "./5.in";
import { Stream } from "./stream";

(async function doThings() {
  assertEqual((await execIntcode([1, 0, 0, 0, 99])).memory, [2, 0, 0, 0, 99]);
  assertEqual((await execIntcode([2, 3, 0, 3, 99])).memory, [2, 3, 0, 6, 99]);
  assertEqual((await execIntcode([2, 4, 4, 5, 99, 0])).memory, [
    2,
    4,
    4,
    5,
    99,
    9801
  ]);
  assertEqual((await execIntcode([1, 1, 1, 4, 99, 5, 6, 0, 99])).memory, [
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

  async function prepareAndRun(program, noun, verb) {
    const actualProgram = [...program];
    actualProgram[1] = noun;
    actualProgram[2] = verb;
    return (await execIntcode(actualProgram)).memory[0];
  }

  assertEqual(await prepareAndRun(getOldInput(), 12, 2), 3101844);
  assertEqual(await prepareAndRun(getOldInput(), 84, 78), 19690720);

  assertEqual((await execIntcode(getInput(), new Stream([1]))).stdout.peek(), [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    14155342
  ]);

  assertEqual((await execIntcode(getInput(), new Stream([5]))).stdout.peek(), [
    8684145
  ]);
})();
