import { Controls } from "./controls.js";

import { changeScene, scenes } from "./main.js";

import { Camera } from "./camera.js";

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
  });

  me = partyLoadMyShared({
    x: 2, // x location in grid cells
    y: 2, // y location in grid cells
    speed: 1, // speed in pixels per frame
    color: "red",
  });
  guests = partyLoadGuestShareds();
}

export function setup() {
  if (partyIsHost()) setupHost();
}

export function enter() {}

export function update() {
  if (partyIsHost()) updateHost();
  // character
  if (controls.up.pressed) me.y -= me.speed;
  if (controls.down.pressed) me.y += me.speed;
  if (controls.left.pressed) me.x -= me.speed;
  if (controls.right.pressed) me.x += me.speed;

  // camera
  camera.follow(me.x * 64, me.y * 64, 0.1);

  // controls
  controls.tick();
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

  shared.blocks = blocks;
}

function updateHost() {
  for (const guest of guests) {
    for (const treasure of shared.treasures) {
      // if (dist(guest.x, guest.y, treasure.x, treasure.y) < 1) {
      if (guest.x === treasure.x && guest.y === treasure.y) {
        treasure.alive = false;
      }
    }
  }
}

export function draw() {
  clear();

  // scroll
  translate(width * 0.5, height * 0.5);
  translate(-camera.x, -camera.y);

  // draw
  drawGrid();
  drawBlocks();
  drawTreasures();
  drawGuests();
}

export function mousePressed() {
  // changeScene(scenes.title);
}

function drawGuests() {
  for (const guest of guests) {
    push();
    fill("red");
    ellipse(guest.x * 64 + 32, guest.y * 64 + 32, 64, 64);
    pop();
  }
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
