import { generateMap } from "./map.js";
import { makeId } from "./util/utilities.js";
import { filterInPlace } from "./util/utilities.js";
import { CONFIG } from "./config.js";
let shared;
let guests;

export function preload() {
  // shared should be written ONLY by host
  shared = partyLoadShared("shared", {
    map: [[]], // 2D array of booleans
    scores: {}, // object of "id: score" pairs
    items: [], // array of { x, y, type, id } objects
  });

  guests = partyLoadGuestShareds();
}

export function setup() {
  if (!partyIsHost()) return;
  const { map, items } = generateMap(CONFIG.grid.cols, CONFIG.grid.rows);

  shared.map = map;
  shared.items = items;

  partySubscribe("moveCrate", onMoveCrate);
  partySubscribe("shoot", onShoot);
}

function onMoveCrate(data) {
  if (!partyIsHost()) return;
  const crate = itemsOfType("crate").find((c) => c.id === data.id);
  if (!crate) return;
  crate.x = data.newX;
  crate.y = data.newY;
}

function onShoot(data) {
  if (!partyIsHost()) return;
  // add a bullet
  shared.items.push({
    x: data.x,
    y: data.y,
    type: "bullet",
    alive: true,
    facing: data.facing,
    color: data.color,
    id: makeId(),
  });
}

export function update() {
  if (!partyIsHost()) return;

  // check for treasure collection
  const treasures = itemsOfType("treasure");
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
  const floorSwitches = itemsOfType("floorSwitch");
  const crates = itemsOfType("crate");
  for (const floorSwitch of floorSwitches) {
    const pressedByGuest = guests.some(
      (guest) => guest.x === floorSwitch.x && guest.y === floorSwitch.y
    );
    const pressedByCrate = crates.some(
      (crate) => crate.alive && crate.x === floorSwitch.x && crate.y === floorSwitch.y
    );
    const pressed = pressedByGuest || pressedByCrate;
    shared.items
      .filter((g) => floorSwitch.targets.includes(g.id))
      .forEach((door) => (door.blocking = !pressed));
  }

  // handle bullet movement
  const bullets = itemsOfType("bullet");
  for (const bullet of bullets) {
    const directionDict = {
      down: 0,
      up: PI,
      left: PI / 2,
      right: -PI / 2,
    };
    if (!bullet.alive) continue;

    const dx = -sin(directionDict[bullet.facing]);
    const dy = cos(directionDict[bullet.facing]);

    const newX = bullet.x + dx * CONFIG.game.bulletSpeed;
    const newY = bullet.y + dy * CONFIG.game.bulletSpeed;

    const roundedX = round(newX);
    const roundedY = round(newY);

    // check for collision with walls and closed doors
    if (
      shared.map[roundedX]?.[roundedY] ||
      itemsOfType("door").some((d) => d.x === roundedX && d.y === roundedY && d.blocking)
    ) {
      bullet.alive = false;
      continue;
    }

    // check for collision with crates
    const maxCrateHits = 3;
    const crate = crates.find((c) => c.x === roundedX && c.y === roundedY && c.alive);
    if (crate) {
      crate.hits++;
      crate.alpha = map(crate.hits, 0, maxCrateHits, 255, 0);
      if (crate.hits >= maxCrateHits) {
        crate.alive = false;
      }
      bullet.alive = false;
      continue;
    }

    // move the bullet
    bullet.x = newX;
    bullet.y = newY;
  }

  // remove dead items
  // filterInPlace(shared.items, (item) => !item.dead);
}

function itemsOfType(type) {
  return shared.items.filter((g) => g.type === type);
}
