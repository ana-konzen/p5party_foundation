import { CONFIG } from "./config.js";
import { makeId } from "./utilities.js";
import { Controls } from "./controls.js";

// setup controls
const controls = new Controls();
controls.bind("ArrowUp", "up");
controls.bind("w", "up");
controls.bind("ArrowDown", "down");
controls.bind("s", "down");
controls.bind("ArrowLeft", "left");
controls.bind("a", "left");
controls.bind("ArrowRight", "right");
controls.bind("d", "right");

let me;
let guests;
let shared;

export function preload() {
  me = partyLoadMyShared({
    x: CONFIG.game.playerStartX, // x location in grid cells
    y: CONFIG.game.playerStartY, // y location in grid cells
    color: "gray", // color to draw avatar
    id: makeId(), // a unique string id
  });
  guests = partyLoadGuestShareds();
  shared = partyLoadShared("shared");
}

export function setup() {
  me.color = CONFIG.colors[(guests.length - 1) % CONFIG.colors.length];
}

export function update() {
  if (controls.up.pressed) tryMove(0, -1);
  if (controls.down.pressed) tryMove(0, 1);
  if (controls.left.pressed) tryMove(-1, 0);
  if (controls.right.pressed) tryMove(1, 0);

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
