import { Controls } from "./controls.js";
import { Camera } from "./camera.js";
import { randomInt } from "./utilities.js";
import { changeScene, scenes } from "./main.js";

const CONFIG = {
  grid: {
    size: 64, // size of each grid cell in pixels
    rows: 64, // number of rows in the grid
    cols: 64, // number of columns in the grid
  },
  game: {
    numTreasures: 1000,
    numBlocks: 1000,
    playerStartX: 2,
    playerStartY: 2,
  },
  colors: ["red", "orange", "yellow", "green", "blue", "purple"],
};

// p5.party shared objects
let me;
let guests;
let shared;

// setup camera
const camera = new Camera();

// setup controls
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
    scores: {}, // object of "id: score" pairs
  });

  guests = partyLoadGuestShareds();
  me = partyLoadMyShared({
    x: CONFIG.game.playerStartX, // x location in grid cells
    y: CONFIG.game.playerStartY, // y location in grid cells
    color: "gray", // color to draw avatar
    id: randomInt(1000000) + "", // a unique string id
  });
}

export function setup() {
  if (partyIsHost()) setupHost();

  me.color = CONFIG.colors[(guests.length - 1) % CONFIG.colors.length];
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
  camera.follow(me.x * CONFIG.grid.size, me.y * CONFIG.grid.size, 0.1);

  // controls
  controls.tick();
}

function tryMove(x, y) {
  // find the possible new location
  const newX = me.x + x;
  const newY = me.y + y;

  // reject if blocked
  if (shared.blocks.find((block) => block.x === newX && block.y === newY)) return;

  // apply the move
  me.x = newX;
  me.y = newY;
}

function setupHost() {
  // to prevent unnecessary data transfer,
  // we build larger pieces of map data (blocks/treasures) locally
  // and assign it to shared all at once
  // that way p5.party doesn't have to sync every change that occurs
  // during generation

  // init treasures

  const treasures = [];
  for (let i = 0; i < CONFIG.game.numTreasures; i++) {
    treasures.push({
      x: floor(random(CONFIG.grid.cols)),
      y: floor(random(CONFIG.grid.rows)),
      alive: true,
    });
  }
  shared.treasures = treasures;

  // init random blocks
  const blocks = [];
  for (let i = 0; i < CONFIG.game.numBlocks; i++) {
    blocks.push({
      x: floor(random(CONFIG.grid.cols)),
      y: floor(random(CONFIG.grid.rows)),
    });
  }

  // init border blocks
  for (let i = 0; i < CONFIG.grid.cols; i++) {
    blocks.push({ x: i, y: -1 });
    blocks.push({ x: i, y: CONFIG.grid.rows });
    blocks.push({ x: -1, y: i });
    blocks.push({ x: CONFIG.grid.cols, y: i });
  }

  shared.blocks = blocks;
}

function updateHost() {
  // check for treasure collection
  for (const treasure of shared.treasures) {
    if (!treasure.alive) continue;
    for (const guest of guests) {
      if (guest.x === treasure.x && guest.y === treasure.y) {
        treasure.alive = false;
        shared.scores[guest.id] = (shared.scores[guest.id] ?? 0) + 1;
      }
    }
  }
}

export function draw() {
  clear();

  /// draw game board
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

  /// draw overlay
  push();
  drawScores();
  pop();
}

export function mousePressed() {
  changeScene(scenes.title);
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
  rect(0, 0, CONFIG.grid.rows * CONFIG.grid.size, CONFIG.grid.cols * CONFIG.grid.size);
  pop();
}

function drawBlocks() {
  for (const block of shared.blocks) {
    push();
    fill("#555");
    rect(block.x * CONFIG.grid.size + 4, block.y * CONFIG.grid.size + 4, 56, 56);
    pop();
  }
}
function drawTreasures() {
  for (const treasure of shared.treasures) {
    if (!treasure.alive) continue;
    push();
    fill("yellow");
    ellipse(treasure.x * CONFIG.grid.size + 32, treasure.y * CONFIG.grid.size + 32, 16, 16);
    pop();
  }
}

function drawGuests() {
  for (const guest of guests) {
    push();
    fill(guest.color);
    ellipse(guest.x * CONFIG.grid.size + 32, guest.y * CONFIG.grid.size + 32, 64, 64);
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
