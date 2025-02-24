import { Controls } from "./controls.js";

import { changeScene, scenes } from "./main.js";

import { Camera } from "./camera.js";

import { randomInt } from "./utilities.js";

const camera = new Camera();
let me;
let guests;
let shared;

export const controls = new Controls();
controls.bind("ArrowUp", "up");
controls.bind("w", "up");
controls.bind("ArrowDown", "down");
controls.bind("s", "down");
controls.bind("ArrowLeft", "left");
controls.bind("a", "left");
controls.bind("ArrowRight", "right");
controls.bind("d", "right");

export function preload() {
  partyConnect("wss://demoserver.p5party.org", "bakse-tomb");

  shared = partyLoadShared("shared", {
    treasures: [], // array of { x, y, alive } objects
    blocks: [], // array of { x, y } objects
    scores: {}, // object of { id: score } pairs
  });

  me = partyLoadMyShared({
    x: 2, // x location in grid cells
    y: 2, // y location in grid cells
    color: "gray",
    id: randomInt(1000000) + "",
  });
  guests = partyLoadGuestShareds();
}

export function setup() {
  if (partyIsHost()) setupHost();

  const colors = ["red", "orange", "yellow", "green", "blue", "purple"];
  me.color = colors[(guests.length - 1) % colors.length];
}

export function enter() {}

export function update() {
  if (partyIsHost()) updateHost();

  // character
  if (controls.up.pressed) tryMove(0, -1);
  if (controls.down.pressed) tryMove(0, 1);
  if (controls.left.pressed) tryMove(-1, 0);
  if (controls.right.pressed) tryMove(1, 0);

  // camera
  camera.follow(me.x * 64, me.y * 64, 0.1);

  // controls
  controls.tick();
}

function tryMove(x, y) {
  const newX = me.x + x;
  const newY = me.y + y;
  for (const block of shared.blocks) {
    if (block.x === newX && block.y === newY) return;
  }
  me.x = newX;
  me.y = newY;
}

function setupHost() {
  // init treasures

  const treasures = [];
  for (let i = 0; i < 1000; i++) {
    treasures.push({
      x: floor(random(64)),
      y: floor(random(64)),
      alive: true,
    });
  }

  // to prevent unnecessary data transfer,
  // we build the treasures array locally
  // and assign it shared all at once
  shared.treasures = treasures;

  // init blocks
  const blocks = [];
  for (let i = 0; i < 1000; i++) {
    blocks.push({
      x: floor(random(64)),
      y: floor(random(64)),
    });
  }

  for (let i = 0; i < 64; i++) {
    blocks.push({ x: i, y: -1 });
    blocks.push({ x: i, y: 64 });
    blocks.push({ x: -1, y: i });
    blocks.push({ x: 64, y: i });
  }

  shared.blocks = blocks;
}

function updateHost() {
  for (const guest of guests) {
    for (const treasure of shared.treasures) {
      if (!treasure.alive) continue;
      if (guest.x === treasure.x && guest.y === treasure.y) {
        treasure.alive = false;
        shared.scores[guest.id] = (shared.scores[guest.id] ?? 0) + 1;
      }
    }
  }
}

export function draw() {
  clear();

  // draw game board
  push();
  // scroll
  translate(width * 0.5, height * 0.5);
  translate(-camera.x, -camera.y);

  // draw
  drawGrid();
  drawBlocks();
  drawTreasures();
  drawGuests();
  pop();

  // draw overlay
  push();
  drawScores();
  pop();
}

export function mousePressed() {
  changeScene(scenes.title);
}

function drawGrid() {
  push();
  const ROWS = 64;
  const COLS = 64;
  const SIZE = 64;

  noFill();
  stroke(0, 0, 0, 50);
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      // fill((row + col) % 2 === 0 ? "#111" : "#222");
      rect(col * SIZE, row * SIZE, SIZE, SIZE);
    }
  }

  noFill();
  stroke("black");
  strokeWeight(4);
  rect(0, 0, ROWS * SIZE, COLS * SIZE);
  pop();
}

function drawBlocks() {
  for (const block of shared.blocks) {
    push();
    fill("#555");
    rect(block.x * 64 + 4, block.y * 64 + 4, 56, 56);
    pop();
  }
}
function drawTreasures() {
  for (const treasure of shared.treasures) {
    if (!treasure.alive) continue;
    push();
    fill("yellow");
    ellipse(treasure.x * 64 + 32, treasure.y * 64 + 32, 16, 16);
    pop();
  }
}

function drawGuests() {
  for (const guest of guests) {
    push();
    fill(guest.color);
    ellipse(guest.x * 64 + 32, guest.y * 64 + 32, 64, 64);
    pop();
  }
}

function drawScores() {
  let y = 30;
  push();

  textSize(20);
  for (const [id, score] of Object.entries(shared.scores)) {
    const guest = guests.find((guest) => guest.id === id);
    console.log(id, JSON.stringify(guests));
    console.log(guest);
    if (!guest) continue;
    console.log(guest.color);
    fill(guest.color);
    text(score, 10, y);
    y += 20;
  }
  pop();
}
