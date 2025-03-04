import { changeScene, scenes } from "./main.js";
import { noiseColor } from "./util/utilities.js";
import { roleKeeper } from "./playScene.js";

let countDown = 180;
let me;
export function preload() {
  me = partyLoadMyShared();
}

export function enter() {
  me.status = "waiting";
}

export function leave() {
  me.status = "playing";
}

export function draw() {
  background("black");

  // draw info
  push();
  fill("white");
  text("lobby scene", 10, 20);
  pop();

  // draw title
  push();
  fill(noiseColor(millis() / 2000));
  textSize(50);
  textAlign(CENTER, CENTER);
  text("lobby", width * 0.5, height * 0.1);

  const player1 = roleKeeper.guestsWithRole("player1")[0];
  const player2 = roleKeeper.guestsWithRole("player2")[0];

  if (player1) {
    textSize(50);
    text("Player 1\nConnected", width * 0.25, height * 0.5);

    textSize(20);
    text(player1.status, width * 0.25, height * 0.7);
  }
  if (player2) {
    textSize(50);
    text("Player 2\nConnected", width * 0.75, height * 0.5);

    textSize(20);
    text(player2.status, width * 0.75, height * 0.7);
  }

  if (
    player1 &&
    player2 &&
    (player1.status === "ready" || player1.status === "playing") &&
    (player2.status === "ready" || player2.status === "playing")
  ) {
    countDown--;
    textSize(100);
    text(Math.floor(countDown / 60), width * 0.5, height * 0.75);
    if (countDown === 0) {
      changeScene(scenes.play);
    }
  } else {
    countDown = 180;
  }

  pop();
}

export function mousePressed() {
  me.status = "ready";
}
