export class Stream {
  unblock: Function[] = [];

  constructor(private readonly buffer: number[] = []) {}

  async write(number: number) {
    if (this.unblock.length > 0) {
      this.unblock.shift()(number);
    } else {
      this.buffer.push(number);
    }
  }

  async read() {
    if (this.buffer.length === 0) {
      const value: number = await new Promise(resolve => {
        this.unblock.push(resolve);
      });
      return value;
    }
    return this.buffer.shift();
  }

  peek() {
    return this.buffer;
  }
}
