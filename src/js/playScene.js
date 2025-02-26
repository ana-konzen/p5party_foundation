import { CONFIG } from "./config.js";
import { Camera } from "./camera.js";
import { changeScene, scenes } from "./main.js";
import { iterate2D } from "./utilities.js";

import * as player from "./player.js";
import * as host from "./host.js";

// p5.party shared objects
// let me;
let me;
let guests;
let shared;

// setup camera
const camera = new Camera();

export function preload() {
  partyConnect("wss://demoserver.p5party.org", "bakse-tomb");

  host.preload();
  player.preload();

  shared = partyLoadShared("shared");
  guests = partyLoadGuestShareds();
  me = partyLoadMyShared();
}

export function setup() {
  if (partyIsHost()) host.setup();
  player.setup();
}

export function enter() {}

export function update() {
  if (partyIsHost()) host.update();
  player.update();
  camera.follow(me.x * CONFIG.grid.size, me.y * CONFIG.grid.size, 0.1);
}

export function mousePressed() {
  changeScene(scenes.title);
}

export function draw() {
  clear();

  /// draw game board
  push();
  // scroll
  translate(width * 0.5, height * 0.5);
  scale(1);
  translate(-camera.x, -camera.y);

  // draw
  drawGrid();
  drawMap();
  drawItems();
  drawGuests();
  pop();

  /// draw overlay
  push();
  drawScores();
  pop();
}

/// draw functions
function drawGrid() {
  push();
  noFill();
  stroke(0, 0, 0, 50);
  for (let row = 0; row < CONFIG.grid.rows; row++) {
    for (let col = 0; col < CONFIG.grid.cols; col++) {
      rect(col * CONFIG.grid.size, row * CONFIG.grid.size, CONFIG.grid.size, CONFIG.grid.size);
    }
  }

  noFill();
  stroke("black");
  strokeWeight(4);
  rect(0, 0, CONFIG.grid.cols * CONFIG.grid.size, CONFIG.grid.rows * CONFIG.grid.size);
  pop();
}

function drawMap() {
  push();
  fill("#555");
  for (const [x, y, value] of iterate2D(shared.map)) {
    if (value) {
      rect(x * CONFIG.grid.size + 4, y * CONFIG.grid.size + 4, 56, 56);
    }
  }

  pop();
}

function drawItems() {
  push();
  for (const item of shared.items) {
    if (!item.alive && !item.blocking && item.type !== "floor_switch") continue;
    if (item.type === "floor_switch") {
      fill("#335");
      ellipse(item.x * CONFIG.grid.size + 32, item.y * CONFIG.grid.size + 32, 48, 48);
      continue;
    }
    if (item.type === "treasure") {
      fill("yellow");
      ellipse(item.x * CONFIG.grid.size + 32, item.y * CONFIG.grid.size + 32, 16, 16);
      continue;
    }
    if (item.type === "door") {
      fill("#335");
      rect(item.x * CONFIG.grid.size + 4, item.y * CONFIG.grid.size + 4, 56, 56);
      continue;
    }
    if (item.type === "crate") {
      fill("brown");
      rect(item.x * CONFIG.grid.size + 4, item.y * CONFIG.grid.size + 4, 56, 56);
      continue;
    }
  }
  pop();
}

function drawGuests() {
  push();
  for (const guest of guests) {
    fill(guest.color);
    ellipse(guest.x * CONFIG.grid.size + 32, guest.y * CONFIG.grid.size + 32, 64, 64);
  }
  pop();
}

function drawScores() {
  let y = 30;
  push();
  textSize(20);
  for (const [id, score] of Object.entries(shared.scores)) {
    const guest = guests.find((guest) => guest.id === id);
    if (!guest) continue;
    fill(guest.color);
    text(score, 10, y);
    y += 20;
  }
  pop();
}
