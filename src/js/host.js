import { generateMap } from "./map.js";

import { CONFIG } from "./config.js";
let shared;
let guests;

export function preload() {
  // shared should be written ONLY by host
  shared = partyLoadShared("shared", {
    map: [[]], // 2D array of booleans
    scores: {}, // object of "id: score" pairs
    gadgets: [], // array of { x, y, type, id } objects
  });

  guests = partyLoadGuestShareds();
}

export function setup() {
  if (!partyIsHost()) return;
  const { map, gadgets } = generateMap(CONFIG.grid.cols, CONFIG.grid.rows);

  shared.map = map;
  shared.gadgets = gadgets;

  partySubscribe("moveCrate", onMoveCrate);
}

function onMoveCrate(data) {
  if (!partyIsHost()) return;
  const crate = selectCadget("crate").find((c) => c.id === data.id);
  if (!crate) return;
  crate.x = data.newX;
  crate.y = data.newY;
}

export function update() {
  if (!partyIsHost()) return;

  // check for treasure collection
  const treasures = selectCadget("treasure");
  for (const treasure of treasures) {
    if (!treasure.alive) continue;
    for (const guest of guests) {
      if (guest.x === treasure.x && guest.y === treasure.y) {
        treasure.alive = false;
        shared.scores[guest.id] = (shared.scores[guest.id] ?? 0) + 1;
      }
    }
  }

  // operate floor switches
  const floorSwitches = selectCadget("floor_switch");
  const crates = selectCadget("crate");
  for (const floorSwitch of floorSwitches) {
    const pressedByGuest = guests.some(
      (guest) => guest.x === floorSwitch.x && guest.y === floorSwitch.y
    );
    const pressedByCrate = crates.some(
      (crate) => crate.x === floorSwitch.x && crate.y === floorSwitch.y
    );
    const pressed = pressedByGuest || pressedByCrate;
    shared.gadgets
      .filter((g) => floorSwitch.targets.includes(g.id))
      .forEach((door) => (door.blocking = !pressed));
  }
}

function selectCadget(type) {
  return shared.gadgets.filter((g) => g.type === type);
}
