import { assertEqual, assertNever } from "./assert";
import { input, test1, test2, test3 } from "./7.in";
import { createStream, execIntcode } from "./5";

// https://stackoverflow.com/questions/39927452/recursively-print-all-permutations-of-a-string-javascript
function* getPermutations(arr: any[], n = arr.length) {
  if (n <= 1) yield arr.slice();
  else
    for (let i = 0; i < n; i++) {
      yield* getPermutations(arr, n - 1);
      const j = n % 2 ? 0 : i;
      [arr[n - 1], arr[j]] = [arr[j], arr[n - 1]];
    }
}

assertEqual(
  [...getPermutations([1, 2, 3])],
  [
    [1, 2, 3],
    [2, 1, 3],
    [3, 1, 2],
    [1, 3, 2],
    [2, 3, 1],
    [3, 2, 1]
  ]
);

function getSignal(memory: number[], phaseSettings: number[]) {
  let prevOutputStream = createStream([0]);
  prevOutputStream.next();

  for (let phaseSetting of phaseSettings) {
    const memCopy = [...memory];
    const stdin = [
      phaseSetting,
      ...prevOutputStream.next({ command: "flush" }).value
    ];
    prevOutputStream = execIntcode(memCopy, stdin).stdout;
  }

  return prevOutputStream.next({ command: "flush" }).value;
}

function getMaxThrusterSignal(memory: number[]) {
  const phaseSettingsPermutations = [...getPermutations([0, 1, 2, 3, 4])];
  const maxSignal = phaseSettingsPermutations.reduce(
    (max, permutation) => Math.max(max, getSignal(memory, permutation)),
    0
  );
  return maxSignal;
}

assertEqual(getMaxThrusterSignal(test1), 43210);
assertEqual(getMaxThrusterSignal(test2), 54321);
assertEqual(getMaxThrusterSignal(test3), 65210);
assertEqual(getMaxThrusterSignal(input), 75228);
