import { Controls } from "./controls.js";
import { Camera } from "./camera.js";
import { makeId, iterate2D } from "./utilities.js";
import { changeScene, scenes } from "./main.js";
import { generateMap } from "./map.js";

const CONFIG = {
  grid: {
    size: 64, // size of each grid cell in pixels
    cols: 33, // number of columns in the grid
    rows: 33, // number of rows in the grid
  },
  game: {
    numTreasures: 1000,
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
    map: [[]], // 2D array of booleans
    treasures: [], // array of { x, y, alive } objects
    crates: [], // array of { x, y, alive } objects
    scores: {}, // object of "id: score" pairs
  });

  guests = partyLoadGuestShareds();
  me = partyLoadMyShared({
    x: CONFIG.game.playerStartX, // x location in grid cells
    y: CONFIG.game.playerStartY, // y location in grid cells
    color: "gray", // color to draw avatar
    id: makeId(), // a unique string id
  });
}

export function setup() {
  if (partyIsHost()) setupHost();

  me.color = CONFIG.colors[(guests.length - 1) % CONFIG.colors.length];
  console.log("me", me.color);

  partySubscribe("moveCrate", (data) => {
    if (!partyIsHost()) return;
    const crate = shared.crates.find((c) => c.id === data.id);
    if (!crate) return;
    crate.x = data.newX;
    crate.y = data.newY;
  });
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
  const newX = me.x + x;
  const newY = me.y + y;

  // reject if out of bounds
  if (newX < 0 || newX >= CONFIG.grid.cols || newY < 0 || newY >= CONFIG.grid.rows) {
    return;
  }

  // reject if blocked by map
  if (shared.map[newX][newY]) {
    return;
  }

  // reject if blocked by crate
  const c = shared.crates.find((c) => c.x === newX && c.y === newY);
  const otherSideWall = shared.map[newX + x][newY + y];
  const otherSideCrate = shared.crates.find((c) => c.x === newX + x && c.y === newY + y && c.alive);
  const otherSideTreasure = shared.treasures.find(
    (t) => t.x === newX + x && t.y === newY + y && t.alive
  );
  const otherSideGuest = guests.find((g) => g.x === newX + x && g.y === newY + y);
  const otherSideBlocked = otherSideCrate || otherSideWall || otherSideTreasure || otherSideGuest;
  if (c && otherSideBlocked) return;

  // push crate
  if (c) {
    partyEmit("moveCrate", { id: c.id, newX: c.x + x, newY: c.y + y });
  }

  // move
  me.x = newX;
  me.y = newY;
}

function setupHost() {
  // to prevent unnecessary data transfer,
  // we build larger pieces of map data (map/treasures) locally
  // and assign it to shared all at once
  // that way p5.party doesn't have to sync every change that occurs
  // during generation

  const { map, treasures, crates } = generateMap(CONFIG.grid.cols, CONFIG.grid.rows);

  shared.map = map;
  shared.treasures = treasures;
  shared.crates = crates;
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
  scale(1);
  translate(-camera.x, -camera.y);

  // scroll (debug)
  // translate(50, 50);
  // scale(0.2);
  // translate(-camera.x, -camera.y);

  // draw
  drawGrid();
  drawMap();
  drawTreasures();
  drawCrates();
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

function drawTreasures() {
  push();
  fill("yellow");
  for (const treasure of shared.treasures) {
    if (!treasure.alive) continue;
    ellipse(treasure.x * CONFIG.grid.size + 32, treasure.y * CONFIG.grid.size + 32, 16, 16);
  }
  pop();
}

function drawCrates() {
  push();
  fill("brown");
  for (const crate of shared.crates) {
    if (!crate.alive) continue;
    rect(crate.x * CONFIG.grid.size + 4, crate.y * CONFIG.grid.size + 4, 56, 56);
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
