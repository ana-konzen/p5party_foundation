import { changeScene, scenes } from "./main.js";
import { noiseColor } from "./util/utilities.js";

let shared;
export function preload() {
  shared = partyLoadShared("shared");
}
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
  text("You Win!", width * 0.5, height * 0.25);

  textSize(50);
  text("Player 1 Loot", width * 0.25, height * 0.5);
  text("Player 2 Loot", width * 0.75, height * 0.5);

  textSize(100);
  text(shared.players.player1.score, width * 0.25, height * 0.7);
  text(shared.players.player2.score, width * 0.75, height * 0.7);

  pop();
}

export function mousePressed() {
  changeScene(scenes.lobby);
}
