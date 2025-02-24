// return a random integer between in range [a, b)
export function randomInt(a, b) {
  return floor(random(a, b));
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
