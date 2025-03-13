import { changeScene, scenes } from "./main.js";
import { noiseColor } from "./util/utilities.js";
import { roleKeeper } from "./playScene.js";

let shared;
export function preload() {
  shared = partyLoadShared("shared");
}

export function update() {
  const player1 = roleKeeper.guestsWithRole("player1")[0];
  const player2 = roleKeeper.guestsWithRole("player2")[0];

  if (player1 && player2 && shared.gameState === "playing") {
    changeScene(scenes.play);
  }
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

  textSize(20);
  if (shared.gameState === "waiting") {
    text("Waiting for Players", width * 0.5, height * 0.2);
  }
  if (shared.gameState === "playing" || shared.gameState === "win") {
    text("Game In Progress", width * 0.5, height * 0.2);
  }

  const player1 = roleKeeper.guestsWithRole("player1")[0];
  const player2 = roleKeeper.guestsWithRole("player2")[0];

  if (player1) {
    textSize(50);
    text("Player 1\nConnected", width * 0.25, height * 0.5);

    textSize(20);
    if (roleKeeper.myRole() === "player1") {
      text("Click to Leave", width * 0.25, height * 0.7);
    }
  } else {
    textSize(50);
    text("Click to Join", width * 0.25, height * 0.5);
  }
  if (player2) {
    textSize(50);
    text("Player 2\nConnected", width * 0.75, height * 0.5);

    textSize(20);
    if (roleKeeper.myRole() === "player2") {
      text("Click to Leave", width * 0.75, height * 0.7);
    }
  } else {
    textSize(50);
    text("Click to Join", width * 0.75, height * 0.5);
  }

  // display clients role, centered bottom
  textSize(20);
  if (roleKeeper.myRole() === "player1") {
    text("You are Player 1", width * 0.5, height * 0.9);
  }
  if (roleKeeper.myRole() === "player2") {
    text("You are Player 2", width * 0.5, height * 0.9);
  }
  if (roleKeeper.myRole() === "unassigned") {
    text("You are Spectating", width * 0.5, height * 0.9);
  }

  pop();
}

export function mousePressed() {
  if (mouseX < width * 0.5) {
    if (roleKeeper.myRole() === "player1") {
      roleKeeper.requestRole("unassigned");
    } else {
      roleKeeper.requestRole("player1");
    }
  }
  if (mouseX > width * 0.5) {
    if (roleKeeper.myRole() === "player2") {
      roleKeeper.requestRole("unassigned");
    } else {
      roleKeeper.requestRole("player2");
    }
  }
}
