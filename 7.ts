import { assertEqual, assertNever } from "./assert";
import { input, test1, test2, test3, test4, test5 } from "./7.in";
import { execIntcode } from "./intcode";
import { Stream } from "./stream";
import { hackyAwait } from "./await";

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

/***********************************************************/
/***********************************************************/

hackyAwait(async () => {
  async function getSignal(
    memory: number[],
    phaseSettings: number[],
    feedback: boolean
  ) {
    let streams = phaseSettings.map((phaseSetting, index) =>
      index ? new Stream([phaseSetting]) : new Stream([phaseSetting, 0])
    );
    streams.push(feedback ? streams[0] : new Stream());

    await Promise.all(
      phaseSettings.map((_, i) =>
        execIntcode([...memory], streams[i], streams[i + 1])
      )
    );

    return streams[streams.length - 1].peek()[0];
  }

  async function getMaxThrusterSignal(
    memory: number[],
    phaseSettings: number[],
    feedback = false
  ) {
    let maxSignal = 0;
    for (let permutation of getPermutations(phaseSettings)) {
      const signal = await getSignal(memory, permutation, feedback);
      maxSignal = Math.max(maxSignal, signal);
    }
    return maxSignal;
  }

  assertEqual(await getMaxThrusterSignal(test1, [0, 1, 2, 3, 4]), 43210);
  assertEqual(await getMaxThrusterSignal(test2, [0, 1, 2, 3, 4]), 54321);
  assertEqual(await getMaxThrusterSignal(test3, [0, 1, 2, 3, 4]), 65210);
  assertEqual(await getMaxThrusterSignal(input, [0, 1, 2, 3, 4]), 75228);
  assertEqual(
    await getMaxThrusterSignal(test4, [5, 6, 7, 8, 9], true),
    139629729
  );
  assertEqual(await getMaxThrusterSignal(test5, [5, 6, 7, 8, 9], true), 18216);
  assertEqual(
    await getMaxThrusterSignal(input, [5, 6, 7, 8, 9], true),
    79846026
  );
});
