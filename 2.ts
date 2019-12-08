import { assertEqual, assertNever } from "./assert";

type State =
  | "OPCODE"
  | "BINARY_OP_LEFT"
  | "BINARY_OP_RIGHT"
  | "BINARY_OP_DEST"
  | "FINISHED";

const add = (a: number, b: number) => a + b;
const mult = (a: number, b: number) => a * b;

type Operation = typeof add | typeof mult;

/**************************
 **************************/

function* machine() {
  let state: State = "OPCODE";
  let operation: Operation | null = null;
  const stack = [];
  let newMemory: number[];

  while (true) {
    const { code, memory } = yield newMemory;
    newMemory = [...memory];

    switch (state) {
      case "OPCODE":
        switch (code) {
          case 1:
            operation = add;
            state = "BINARY_OP_LEFT";
            break;
          case 2:
            operation = mult;
            state = "BINARY_OP_LEFT";
            break;
          case 99:
            state = "FINISHED";
            break;
          default:
            throw new Error("INVALID OPCODE");
        }
        break;

      case "BINARY_OP_LEFT":
        stack.push(memory[code]);
        state = "BINARY_OP_RIGHT";
        break;

      case "BINARY_OP_RIGHT": {
        stack.push(memory[code]);
        state = "BINARY_OP_DEST";
        break;
      }

      case "BINARY_OP_DEST":
        const right = stack.pop();
        const left = stack.pop();
        newMemory[code] = operation(left, right);
        operation = null;
        state = "OPCODE";
        break;

      case "FINISHED":
        return newMemory;

      default:
        assertNever(state, "INVALID STATE");
        break;
    }
  }
}

function run(memory: number[]) {
  const m = machine();
  m.next();
  let address = 0;
  let done = false;

  do {
    const res = m.next({ code: memory[address], memory });
    // @ts-ignore
    memory = res.value;
    done = res.done;
    address++;
  } while (!done);

  return memory;
}

assertEqual(run([1, 0, 0, 0, 99]), [2, 0, 0, 0, 99]);
assertEqual(run([2, 3, 0, 3, 99]), [2, 3, 0, 6, 99]);
assertEqual(run([2, 4, 4, 5, 99, 0]), [2, 4, 4, 5, 99, 9801]);
assertEqual(run([1, 1, 1, 4, 99, 5, 6, 0, 99]), [30, 1, 1, 4, 2, 5, 6, 0, 99]);

function prepareAndRun(program, noun, verb) {
  const actualProgram = [...program];
  actualProgram[1] = noun;
  actualProgram[2] = verb;
  return run(actualProgram)[0];
}

const input = getInput();
assertEqual(prepareAndRun(input, 12, 2), 3101844);

for (let noun = 0; noun < 99; noun++) {
  for (let verb = 0; verb < 99; verb++) {
    const result = prepareAndRun(input, noun, verb);
    if (result === 19690720) {
      console.log("RESULT:", { noun, verb, result: 100 * noun + verb });
    }
  }
}

function getInput() {
  return [
    1,
    0,
    0,
    3,
    1,
    1,
    2,
    3,
    1,
    3,
    4,
    3,
    1,
    5,
    0,
    3,
    2,
    6,
    1,
    19,
    1,
    5,
    19,
    23,
    2,
    9,
    23,
    27,
    1,
    6,
    27,
    31,
    1,
    31,
    9,
    35,
    2,
    35,
    10,
    39,
    1,
    5,
    39,
    43,
    2,
    43,
    9,
    47,
    1,
    5,
    47,
    51,
    1,
    51,
    5,
    55,
    1,
    55,
    9,
    59,
    2,
    59,
    13,
    63,
    1,
    63,
    9,
    67,
    1,
    9,
    67,
    71,
    2,
    71,
    10,
    75,
    1,
    75,
    6,
    79,
    2,
    10,
    79,
    83,
    1,
    5,
    83,
    87,
    2,
    87,
    10,
    91,
    1,
    91,
    5,
    95,
    1,
    6,
    95,
    99,
    2,
    99,
    13,
    103,
    1,
    103,
    6,
    107,
    1,
    107,
    5,
    111,
    2,
    6,
    111,
    115,
    1,
    115,
    13,
    119,
    1,
    119,
    2,
    123,
    1,
    5,
    123,
    0,
    99,
    2,
    0,
    14,
    0
  ];
}
