// return a random integer between in range [a, b)
export function randomInt() {
  return floor(random(...arguments));
}

// return a random color (expects colorMode(RGB, 255))
export function randomColor() {
  return color(randomInt(0, 255), randomInt(0, 255), randomInt(0, 255));
}

// returns a random color base on noise inputs
export function noiseColor(a = 0, b = 0, c = 0) {
  return color(
    //
    noise(a, b, c + 100) * 255,
    noise(a, b, c + 200) * 255,
    noise(a, b, c + 300) * 255
  );
}

export function removeItemFromArray(a, item) {
  const index = a.indexOf(item);
  if (index > -1) {
    a.splice(index, 1);
  }
}

// creates a 2D array with the given dimensions and fills it with the given value
export function array2D(cols, rows, value) {
  const a = [];
  for (let col = 0; col < cols; col++) {
    a.push([]);
    for (let row = 0; row < rows; row++) {
      a[col][row] = value;
    }
  }
  return a;
}

export function makeId() {
  // 1. Math.random() creates a random number between 0 and 1 (0.123456789)
  // 2. toString(36) converts the number to base-36 (0-9 and a-z) (0.4fzyo6ny8)
  // 3. substring(2, 9) takes 7 characters starting after "0." (4fzyo6n)
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Creates a generator that yields each element in a 2D array along with its coordinates.
 * Useful for iterating over 2D arrays with a for...of loop.
 * @param {Array<Array<any>>} array - The 2D array to iterate over
 * @yields {[number, number, any]} - A tuple of [x, y, value]
 *
 * Example:
 * const grid = [[1, 2], [3, 4]];
 * for (const [x, y, value] of iterate2D(grid)) {
 *   console.log(`Value ${value} at position (${x}, ${y})`);
 * }
 */
export function* iterate2D(array) {
  for (let x = 0; x < array.length; x++) {
    for (let y = 0; y < array[x].length; y++) {
      yield [x, y, array[x][y]];
    }
  }
}
