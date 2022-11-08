import { changeScene, scenes } from "./main.js";
import { noiseColor } from "./utilities.js";

export function draw() {
  background("black");

  // draw info
  push();
  fill("white");
  text("title scene", 10, 20);
  pop();

  // draw title
  push();
  fill(noiseColor(millis() / 2000));
  textSize(50);
  textAlign(CENTER, CENTER);
  text("foundation", width * 0.5, height * 0.5);
  pop();
}

export function mousePressed() {
  changeScene(scenes.play);
}
