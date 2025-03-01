import { CONFIG } from "./config.js";
import { makeId } from "./util/utilities.js";
import { Controls } from "./util/controls.js";
import { itemsOfType, blocksMove, blocksPush } from "./items.js";

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
    if (me.ammo > 0) {
      me.ammo--;
      partyEmit("shoot", { x: me.x, y: me.y, facing: me.facing, color: me.color });
    }
  }

  controls.tick();
}

function tryMove(x, y) {
  const newX = me.x + x;
  const newY = me.y + y;

  // reject if blocked by bounds
  if (newX < 0 || newX >= CONFIG.grid.cols || newY < 0 || newY >= CONFIG.grid.rows) {
    return;
  }

  // reject if blocked by map
  if (shared.map[newX][newY]) return;

  // reject if blocked by item
  if (
    shared.items.some((item) => {
      return item.x === newX && item.y === newY && blocksMove(item);
    })
  ) {
    return;
  }

  // check for crate
  const crate = itemsOfType("crate").find((c) => c.x === newX && c.y === newY);
  if (crate) {
    // if crate, collect info about other side
    const otherSideWall = shared.map[newX + x][newY + y];
    const otherSideGuest = guests.some((g) => g.x === newX + x && g.y === newY + y);
    const otherSideItem = shared.items.some(
      (item) => item.x === newX + x && item.y === newY + y && blocksPush(item)
    );
    const otherSideBlocked = otherSideWall || otherSideGuest || otherSideItem;
    // reject pushing blocked
    if (crate && otherSideBlocked) return;
    // push crate
    partyEmit("moveCrate", { id: crate.id, newX: crate.x + x, newY: crate.y + y });
  }

  // move
  me.x = newX;
  me.y = newY;
}
