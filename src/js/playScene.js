import { CONFIG } from "./config.js";
import { Camera } from "./util/camera.js";
import { RoleKeeper } from "./RoleKeeper.js";
import { iterate2D } from "./util/utilities.js";
import { changeScene, scenes } from "./main.js";

import * as player from "./player.js";
import * as host from "./host.js";
import * as items from "./items.js";

// p5.party shared objects
let shared;

// RoleKeeper - keeps clients assigned to roles (player1, player2)
export let roleKeeper;

// setup camera
const camera = new Camera();

export function preload() {
  partyConnect("wss://demoserver.p5party.org", "bakse-tomb");

  host.preload();
  player.preload();

  shared = partyLoadShared("shared");

  roleKeeper = new RoleKeeper(["player1", "player2"], "unassigned");
}

export function setup() {
  if (partyIsHost()) host.setup();
}

export function enter() {}

export function update() {
  if (partyIsHost()) host.update();
  player.update();
  const p = shared.players[roleKeeper.myRole()];
  camera.follow(p.x * CONFIG.grid.size, p.y * CONFIG.grid.size, 0.1);
}

export function mousePressed() {
  changeScene(scenes.title);
}

/// draw functions
export function draw() {
  clear();

  push();
  // scroll
  translate(width * 0.5, height * 0.5);
  scale(1);
  translate(-camera.x, -camera.y);

  // draw game
  drawGrid();
  drawMap();
  items.drawItems(shared.items);
  drawPlayers();
  pop();

  // draw overlay
  push();
  drawScores();
  drawAmmo();
  pop();
}

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

function drawPlayers() {
  const directionDict = {
    down: 0,
    up: PI,
    left: PI / 2,
    right: -PI / 2,
  };
  push();
  for (const player of Object.values(shared.players)) {
    push();
    translate(player.x * CONFIG.grid.size + 32, player.y * CONFIG.grid.size + 32);
    rotate(directionDict[player.facing]);
    fill(player.color);
    ellipse(0, 0, 64);
    fill("white");
    ellipse(0, 24, 16);
    pop();
  }
  pop();
}

// todo drawScores needs to be updated to use shared.players
function drawScores() {
  let y = 30;
  push();
  textSize(20);
  for (const [id, score] of Object.entries(shared.scores)) {
    // const guest = guests.find((guest) => guest.id === id);
    // if (!guest) continue;
    // fill(guest.color);
    text(score, 10, y);
    y += 20;
  }
  pop();
}

function drawAmmo() {
  push();
  noStroke();
  const p = shared.players[roleKeeper.myRole()];
  for (let i = 0; i < p.ammo; i++) {
    fill(p.color);
    ellipse(20 + i * 20, height - 20, 16);
  }
  pop();
}
