import { changeScene, scenes } from "./main.js";

let pY; // position of ball
let dY; // velocity of ball

export function enter() {
  pY = 100;
  dY = 0;
}

export function update() {
  // physics sim
  pY += dY; // momentum
  dY += 0.5; // gravity
  // test collision
  if (pY > height - 50) {
    pY = height - 50; // eject
    dY = -abs(dY) * 0.8; // bounce
    dY += 1; // fudge
    if (abs(dY) < 1) {
      // sticky
      dY = 0;
    }
  }
}

export function draw() {
  background("black");

  // draw info
  push();
  fill("white");
  text("play scene", 10, 20);
  pop();

  // draw ball
  push();
  fill("red");
  ellipse(width * 0.5, pY, 100, 100);
  pop();
}

export function mousePressed() {
  changeScene(scenes.title);
}
