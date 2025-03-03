import { CONFIG } from "./config.js";
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
// let guests;
let shared;

export function preload() {
  me = partyLoadMyShared();
  shared = partyLoadShared("shared");
}

export function update() {
  if (controls.up.pressed) {
    partyEmit("face", { role: me.role_keeper.role, facing: "up" });
    tryMove(0, -1);
  }
  if (controls.down.pressed) {
    partyEmit("face", { role: me.role_keeper.role, facing: "down" });
    tryMove(0, 1);
  }
  if (controls.left.pressed) {
    partyEmit("face", { role: me.role_keeper.role, facing: "left" });
    tryMove(-1, 0);
  }
  if (controls.right.pressed) {
    partyEmit("face", { role: me.role_keeper.role, facing: "right" });
    tryMove(1, 0);
  }
  if (controls.shoot.pressed) {
    partyEmit("shoot", { role: me.role_keeper.role });
  }

  controls.tick();
}

function tryMove(x, y) {
  const p = shared.players[me.role_keeper.role];
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

  partyEmit("move", { role: me.role_keeper.role, newX, newY });
}
