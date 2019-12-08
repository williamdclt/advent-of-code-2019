import * as _ from "lodash";

export function assertNever(guard: never, msg: string): never {
  throw new Error(msg);
}

export function assert(condition, msg) {
  if (!condition) {
    console.error(msg);
    throw new Error("Assertion failed");
  }
}

export function assertEqual<T>(a: T, b: T) {
  assert(_.isEqual(a, b), { left: a, right: b });
}

export function assertNotEqual<T>(a: T, b: T) {
  assert(!_.isEqual(a, b), { left: a, right: b });
}
