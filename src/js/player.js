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
controls.bind(" ", "shoot");

let me;
let guests;
let shared;

export function preload() {
  me = partyLoadMyShared({
    x: CONFIG.game.playerStartX, // x location in grid cells
    y: CONFIG.game.playerStartY, // y location in grid cells
    color: "gray", // color to draw avatar
    id: makeId(), // a unique string id
    facing: "down", // direction to draw avatar
    ammo: CONFIG.game.playerAmmo, // number of bullets player has
  });
  guests = partyLoadGuestShareds();
  shared = partyLoadShared("shared");
}

export function setup() {
  me.color = CONFIG.colors[(guests.length - 1) % CONFIG.colors.length];
}

export function update() {
  if (controls.up.pressed) {
    tryMove(0, -1);
    console.log(controls);
    me.facing = "up";
  }
  if (controls.down.pressed) {
    tryMove(0, 1);
    me.facing = "down";
  }
  if (controls.left.pressed) {
    tryMove(-1, 0);
    me.facing = "left";
  }
  if (controls.right.pressed) {
    tryMove(1, 0);
    me.facing = "right";
  }
  if (controls.shoot.pressed) {
    if (me.ammo <= 0) return;
    me.ammo--;
    partyEmit("shoot", { x: me.x, y: me.y, facing: me.facing, color: me.color });
  }

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
  if (shared.map[newX][newY]) return;

  // reject if blocked by blocking item (like doors)
  if (shared.items.some((g) => g.x === newX && g.y === newY && g.blocking)) return;

  // reject if blocked by crate
  const crates = shared.items.filter((g) => g.type === "crate" && g.alive);
  const c = crates.find((c) => c.x === newX && c.y === newY);
  const otherSideWall = shared.map[newX + x][newY + y];
  const otherSideGuest = guests.some((g) => g.x === newX + x && g.y === newY + y);
  const otherSideItem = shared.items.some(
    (g) => g.x === newX + x && g.y === newY + y && (g.blocking || g.alive)
  );
  const otherSideBlocked = otherSideWall || otherSideGuest || otherSideItem;
  if (c && otherSideBlocked) return;

  // push crate
  if (c) {
    partyEmit("moveCrate", { id: c.id, newX: c.x + x, newY: c.y + y });
  }

  // move
  me.x = newX;
  me.y = newY;
}
