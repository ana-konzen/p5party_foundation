console.log("hello!");

// p5.js auto detects setup() and draw() but since this code is a module
// the functions aren't global.
// This creates aliases of the p5 functions on window, so p5.js can find them
Object.assign(window, {
  draw,
  setup,
});

function setup() {
  canvas = createCanvas(512, 512);
  noFill();
  noStroke();
}

function draw() {
  background("#333");
}
