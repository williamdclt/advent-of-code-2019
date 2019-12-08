const strInput = <T>(fn: (n: string) => T) => (num: number) => fn(`${num}`);

const isSixDigits = strInput(number => number.length === 6);

const containsAdjacentDigits = strInput(num => {
  let adjacentCount = 0;
  let prevChar = "";

  for (let char of num.split("")) {
    if (prevChar === char) adjacentCount++;
    else if (adjacentCount === 1) break;
    else adjacentCount = 0;
    prevChar = char;
  }

  return adjacentCount === 1;
});

const noDecreasingNumber = strInput(num => {
  let decreasing = false;
  num.split("").reduce((prevChar, currChar) => {
    if (currChar < prevChar) decreasing = true;
    return currChar;
  });
  return !decreasing;
});

function run(start: number, end: number, debug = false) {
  let count = 0;
  for (let i = start; i <= end; i++) {
    if (isSixDigits(i) && containsAdjacentDigits(i) && noDecreasingNumber(i)) {
      count++;
    }
  }

  return count;
}

console.log(run(246515, 739105));
