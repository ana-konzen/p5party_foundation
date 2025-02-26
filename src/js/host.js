import { generateMap } from "./map.js";

import { CONFIG } from "./config.js";
let shared;
let guests;

export function preload() {
  // shared should be written ONLY by host
  shared = partyLoadShared("shared", {
    map: [[]], // 2D array of booleans
    treasures: [], // array of { x, y, alive } objects
    crates: [], // array of { x, y, alive } objects
    scores: {}, // object of "id: score" pairs
    gadgets: [], // array of { x, y, type, id } objects
  });

  guests = partyLoadGuestShareds();
}

export function setup() {
  if (!partyIsHost()) return;
  const { map, treasures, crates, gadgets } = generateMap(CONFIG.grid.cols, CONFIG.grid.rows);

  shared.map = map;
  shared.treasures = treasures;
  shared.crates = crates;
  shared.gadgets = gadgets;

  partySubscribe("moveCrate", onMoveCrate);
}

function onMoveCrate(data) {
  if (!partyIsHost()) return;
  const crate = shared.crates.find((c) => c.id === data.id);
  if (!crate) return;
  crate.x = data.newX;
  crate.y = data.newY;
}

export function update() {
  if (!partyIsHost()) return;

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

  // operate floor switches
  const floorSwitches = shared.gadgets.filter((g) => g.type === "floor_switch");
  for (const floorSwitch of floorSwitches) {
    const pressedByGuest = guests.some(
      (guest) => guest.x === floorSwitch.x && guest.y === floorSwitch.y
    );
    const pressedByCrate = shared.crates.some(
      (crate) => crate.x === floorSwitch.x && crate.y === floorSwitch.y
    );
    const pressed = pressedByGuest || pressedByCrate;
    shared.gadgets
      .filter((g) => floorSwitch.targets.includes(g.id))
      .forEach((door) => (door.closed = !pressed));
  }
}
