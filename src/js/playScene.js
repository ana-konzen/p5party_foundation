import { Camera } from "./util/camera.js";
import { iterate2D } from "./util/utilities.js";
import { CONFIG } from "./config.js";
import { changeScene, scenes } from "./main.js";

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
  drawAmmo();
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
    if (!item.alive && !item.blocking && item.type !== "floorSwitch") continue;
    drawItem(item);
  }
  pop();
}

function drawItem(item) {
  const itemDefaults = {
    crate: {
      size: 56,
      shape: "rect",
      color: "brown",
      alpha: 255,
    },
    treasure: {
      size: 16,
      shape: "ellipse",
      color: "yellow",
    },
    door: {
      size: 56,
      shape: "rect",
      color: "#335",
    },
    floorSwitch: {
      size: 48,
      shape: "ellipse",
      color: "#335",
    },
  };

  item = { ...itemDefaults[item.type], ...item };

  ellipseMode(CORNER);
  const itemColor = color(item.color);
  itemColor.setAlpha(item.alpha ?? 255);
  fill(itemColor);
  const shape = item.shape === "rect" ? rect : ellipse;
  shape(
    item.x * CONFIG.grid.size + (CONFIG.grid.size / 2 - item.size / 2),
    item.y * CONFIG.grid.size + (CONFIG.grid.size / 2 - item.size / 2),
    item.size
  );
}

function drawGuests() {
  const directionDict = {
    down: 0,
    up: PI,
    left: PI / 2,
    right: -PI / 2,
  };
  push();
  for (const guest of guests) {
    push();
    translate(guest.x * CONFIG.grid.size + 32, guest.y * CONFIG.grid.size + 32);
    rotate(directionDict[guest.facing]);
    fill(guest.color);
    ellipse(0, 0, 64);
    fill("white");
    ellipse(0, 24, 16);
    pop();
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

function drawAmmo() {
  push();
  noStroke();
  for (let i = 0; i < me.ammo; i++) {
    fill(me.color);
    ellipse(20 + i * 20, height - 20, 16);
  }
  pop();
}
