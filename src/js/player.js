import { CONFIG } from "./config.js";
import { Controls } from "./util/controls.js";
import { itemsOfType, blocksMove, blocksPush } from "./items.js";

import { roleKeeper } from "./playScene.js";
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

let shared;

export function preload() {
  shared = partyLoadShared("shared");
}

export function update() {
  if (controls.up.pressed) {
    partyEmit("face", { role: roleKeeper.myRole(), facing: "up" });
    tryMove(0, -1);
  }
  if (controls.down.pressed) {
    partyEmit("face", { role: roleKeeper.myRole(), facing: "down" });
    tryMove(0, 1);
  }
  if (controls.left.pressed) {
    partyEmit("face", { role: roleKeeper.myRole(), facing: "left" });
    tryMove(-1, 0);
  }
  if (controls.right.pressed) {
    partyEmit("face", { role: roleKeeper.myRole(), facing: "right" });
    tryMove(1, 0);
  }
  if (controls.shoot.pressed) {
    partyEmit("shoot", { role: roleKeeper.myRole() });
  }

  controls.tick();
}

function tryMove(x, y) {
  const p = shared.players[roleKeeper.myRole()];
  const newX = p.x + x;
  const newY = p.y + y;

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
    const otherSideGuest = Object.values(shared.players).some(
      (g) => g.x === newX + x && g.y === newY + y
    );
    const otherSideItem = shared.items.some(
      (item) => item.x === newX + x && item.y === newY + y && blocksPush(item)
    );
    const otherSideBlocked = otherSideWall || otherSideGuest || otherSideItem;
    // reject pushing blocked
    if (crate && otherSideBlocked) return;
    // push crate
    partyEmit("moveCrate", { id: crate.id, newX: crate.x + x, newY: crate.y + y });
  }

  partyEmit("move", { role: roleKeeper.myRole(), newX, newY });
}
