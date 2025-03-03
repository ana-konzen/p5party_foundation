import { generateMap } from "./map.js";
import { makeId } from "./util/utilities.js";
import { filterInPlace } from "./util/utilities.js";
import { CONFIG } from "./config.js";
import { itemsOfType } from "./items.js";
export let shared;

export function preload() {
  // shared should be written ONLY by host
  shared = partyLoadShared("shared", {
    map: [[]], // 2D array of booleans
    scores: {}, // object of "id: score" pairs
    items: [], // array of { x, y, type, id } objects
    players: {
      player1: { x: 1, y: 1, color: "red", facing: "down", ammo: 10 },
      player2: { x: 2, y: 1, color: "blue", facing: "down", ammo: 10 },
    },
  });
}

export function setup() {
  if (!partyIsHost()) return;
  const { map, items } = generateMap(CONFIG.grid.cols, CONFIG.grid.rows);

  shared.map = map;
  shared.items = items;

  partySubscribe("face", onFace);
  partySubscribe("move", onMove);
  partySubscribe("moveCrate", onMoveCrate);
  partySubscribe("shoot", onShoot);
}

function onFace({ role, facing }) {
  if (!partyIsHost()) return;
  const player = shared.players[role];
  player.facing = facing;
}

function onMove({ role, newX, newY }) {
  if (!partyIsHost()) return;
  const player = shared.players[role];
  player.x = newX;
  player.y = newY;
}

function onMoveCrate({ id, newX, newY }) {
  if (!partyIsHost()) return;
  //todo don't need to filter by crate below
  const crate = itemsOfType("crate").find((c) => c.id === id);
  if (!crate) return;
  crate.x = newX;
  crate.y = newY;
}

function onShoot({ role }) {
  if (!partyIsHost()) return;
  const player = shared.players[role];
  if (player.ammo <= 0) return;
  player.ammo--;

  shared.items.push({
    type: "bullet",
    id: makeId(),
    x: player.x,
    y: player.y,
    facing: player.facing,
    color: player.color,
  });
}

function players() {
  return Object.values(shared.players);
}

export function update() {
  if (!partyIsHost()) return;

  // check for treasure collection
  const treasures = itemsOfType("treasure");
  for (const treasure of treasures) {
    for (const player of players()) {
      if (player.x === treasure.x && player.y === treasure.y) {
        treasure.remove = true;
        shared.scores[player.id] = (shared.scores[player.id] ?? 0) + 1;
      }
    }
  }

  // operate floor switches
  const floorSwitches = itemsOfType("floorSwitch");
  const crates = itemsOfType("crate");
  for (const floorSwitch of floorSwitches) {
    const pressedByGuest = players().some(
      (guest) => guest.x === floorSwitch.x && guest.y === floorSwitch.y
    );
    const pressedByCrate = crates.some(
      (crate) => crate.x === floorSwitch.x && crate.y === floorSwitch.y
    );
    const pressed = pressedByGuest || pressedByCrate;
    itemsOfType("door")
      .filter((g) => floorSwitch.targets.includes(g.id))
      .forEach((door) => (door.open = pressed));
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

    const dx = -sin(directionDict[bullet.facing]);
    const dy = cos(directionDict[bullet.facing]);

    const newX = bullet.x + dx * CONFIG.game.bulletSpeed;
    const newY = bullet.y + dy * CONFIG.game.bulletSpeed;

    const roundedX = round(newX);
    const roundedY = round(newY);

    // check for collision with walls and closed doors
    if (
      shared.map[roundedX]?.[roundedY] ||
      itemsOfType("door").some((door) => door.x === roundedX && door.y === roundedY && !door.open)
    ) {
      bullet.remove = true;
      continue;
    }

    // check for collision with crates
    const maxCrateHits = 3;
    const crate = crates.find((c) => c.x === roundedX && c.y === roundedY);
    if (crate) {
      crate.hits++;
      crate.alpha = map(crate.hits, 0, maxCrateHits, 255, 0);
      if (crate.hits >= maxCrateHits) {
        crate.remove = true;
      }
      bullet.remove = true;
      continue;
    }

    // move the bullet
    bullet.x = newX;
    bullet.y = newY;
  }

  // remove dead items
  filterInPlace(shared.items, (item) => !item.remove);
}
