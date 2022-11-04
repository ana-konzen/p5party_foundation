export function randomInt(a, b) {
  return floor(random(a, b));
}

export function randomColor() {
  return color(randomInt(0, 255), randomInt(0, 255), randomInt(0, 255));
}

export function noiseColor(a = 0, b = 0, c = 0) {
  return color(
    noise(a, b, c + 100) * 255,
    noise(a, b, c + 200) * 255,
    noise(a, b, c + 300) * 255
  );
}
