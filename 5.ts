import { assertEqual, assertNever } from "./assert";
import { getInput, getOldInput } from "./5.in";

type State =
  | "WAITING"
  | "OPCODE"
  | "JUMP_TRUE"
  | "JUMP_FALSE"
  | "JUMP"
  | "CMP_LEFT"
  | "CMP_RIGHT"
  | "BINARY_OP_LEFT"
  | "BINARY_OP_RIGHT"
  | "SAVE"
  | "OUTPUT"
  | "FINISHED";

type Command =
  | { command: "NOOP" }
  | { command: "NEXT" }
  | { command: "READ"; address: number }
  | { command: "SAVE"; address: number; value: any }
  | { command: "JUMP"; address: number }
  | { command: "INPUT" }
  | { command: "OUTPUT"; value: any };

const add = (a: number, b: number) => a + b;
const mult = (a: number, b: number) => a * b;
const lt = (a: number, b: number) => a < b;
const eq = (a: number, b: number) => a == b;

type Operation = typeof add | typeof lt;

/**************************
 **************************/

function* parser(debug = false): Generator<Command, Command, any> {
  let state: State = "OPCODE";
  let operation: Operation | null = null;
  let register = null;
  let command: Command = { command: "NEXT" }; // first command isn't executed
  let modeStack = [];

  function* resolveParam(param: number, mode: string) {
    if (!param && param !== 0) return param;
    if (mode === "0") {
      const command: Command = { command: "READ", address: param };
      return yield command;
    }
    return param;
  }

  while (true) {
    const code = yield command;
    const mode = modeStack.pop();
    const value = yield* resolveParam(code, mode);

    debug && console.log({ state, value, mode, register, code });
    switch (state) {
      case "WAITING":
        command = { command: "NEXT" };
        state = "OPCODE";
        break;

      case "OPCODE":
        const int = `${code}`.padStart(5, "0");
        const opcode = Number.parseInt(int.slice(3));
        modeStack = int.slice(0, 3).split("");

        switch (opcode) {
          case 1:
            operation = add;
            state = "BINARY_OP_LEFT";
            break;
          case 2:
            operation = mult;
            state = "BINARY_OP_LEFT";
            break;
          case 3: {
            register = yield { command: "INPUT" };
            state = "SAVE";
            break;
          }
          case 4: {
            state = "OUTPUT";
            break;
          }
          case 5: {
            state = "JUMP_TRUE";
            break;
          }
          case 6: {
            state = "JUMP_FALSE";
            break;
          }
          case 7: {
            state = "CMP_LEFT";
            operation = lt;
            break;
          }
          case 8: {
            state = "CMP_LEFT";
            operation = eq;
            break;
          }
          case 99:
            state = "FINISHED";
            break;
          default:
            console.error({ opcode, int, value, code, mode });
            throw new Error(`INVALID OPCODE ${opcode}`);
        }
        command = { command: "NEXT" };
        break;

      case "BINARY_OP_LEFT":
        register = value;
        command = { command: "NEXT" };
        state = "BINARY_OP_RIGHT";
        break;

      case "BINARY_OP_RIGHT": {
        const right = value;
        register = operation(register, right);
        operation = null;
        command = { command: "NEXT" };
        state = "SAVE";
        break;
      }

      case "CMP_LEFT":
        register = value;
        command = { command: "NEXT" };
        state = "CMP_RIGHT";
        break;

      case "CMP_RIGHT": {
        const right = value;
        register = operation(register, right) ? 1 : 0;
        operation = null;
        command = { command: "NEXT" };
        state = "SAVE";
        break;
      }

      case "JUMP_TRUE":
        register = !!value;
        state = "JUMP";
        break;

      case "JUMP_FALSE":
        register = !value;
        state = "JUMP";
        break;

      case "JUMP":
        if (register) command = { command: "JUMP", address: value };
        else command = { command: "NOOP" };
        state = "WAITING";
        break;

      case "SAVE":
        command = {
          command: "SAVE",
          address: code,
          value: register
        };
        state = "WAITING";
        break;

      case "OUTPUT":
        command = { command: "OUTPUT", value };
        state = "WAITING";
        break;

      case "FINISHED":
        command = { command: "NEXT" };
        return command;

      default:
        assertNever(state, "INVALID STATE");
        break;
    }
  }
}

function* getInputStream(stream: number[]) {
  for (let element of stream) yield element;
}

function* getOutputStream() {
  const buffer = [];
  let flush = false;

  while (!flush) {
    const { value, flush: doFlush } = yield;
    flush = doFlush;
    if (!flush) {
      buffer.push(value);
    } else {
      return buffer.join("");
    }
  }
}

function run(
  memory: number[],
  stdin = getInputStream([]),
  stdout = getOutputStream(),
  debug = false
) {
  const m = parser(debug);
  m.next();
  stdout.next();

  let param = memory[0];
  let address = 1;
  let done = false;

  do {
    debug && console.log({ param, address });
    debug && console.log("===============");
    const { value: command, done: isDone } = m.next(param);
    debug && console.log(command);
    param = null;
    done = isDone;

    switch (command.command) {
      case "NOOP":
        break;

      case "NEXT":
        param = memory[address];
        address++;
        break;

      case "READ":
        param = memory[command.address];
        break;

      case "JUMP":
        address = command.address;
        break;

      case "SAVE":
        memory[command.address] = command.value;
        break;

      case "INPUT":
        param = stdin.next().value as number;
        break;

      case "OUTPUT":
        debug && console.log("OUTPUT", command);
        // if (command.value !== 0)
        //   throw new Error(`Diagnostic failed ${command.value}`);
        stdout.next({ value: command.value, flush: false });
        break;

      default:
        assertNever(command, "INVALID STATE");
        break;
    }
  } while (!done);

  return { memory, stdout: stdout.next({ value: null, flush: true }).value };
}

assertEqual(run([1, 0, 0, 0, 99]).memory, [2, 0, 0, 0, 99]);
assertEqual(run([2, 3, 0, 3, 99]).memory, [2, 3, 0, 6, 99]);
assertEqual(run([2, 4, 4, 5, 99, 0]).memory, [2, 4, 4, 5, 99, 9801]);
assertEqual(run([1, 1, 1, 4, 99, 5, 6, 0, 99]).memory, [
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
  return run(actualProgram).memory[0];
}

const input = getOldInput();
assertEqual(prepareAndRun(input, 12, 2), 3101844);
assertEqual(prepareAndRun(input, 84, 78), 19690720);

function runWithInput(memory, stdin, debug = false) {
  return run(memory, getInputStream(stdin), getOutputStream(), debug);
}

assertEqual(runWithInput(getInput(), [1]).stdout, "00000000014155342");
assertEqual(runWithInput(getInput(), [5]).stdout, "8684145");
