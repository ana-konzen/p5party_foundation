import { generateMap } from "./map.js";
import { makeId } from "./util/utilities.js";
import { filterInPlace } from "./util/utilities.js";
import { CONFIG } from "./config.js";
import { itemsOfType, blocksMove, blocksPush } from "./items.js";

export let shared;

export function preload() {
  // shared should be written ONLY by host
  shared = partyLoadShared("shared", {
    map: [[]], // 2D array of booleans
    items: [], // array of { x, y, type, id } objects
    players: {
      player1: { x: 1, y: 1, color: "red", facing: "down", ammo: 10, score: 0 },
      player2: { x: 2, y: 1, color: "blue", facing: "down", ammo: 10, score: 0 },
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
  partySubscribe("shoot", onShoot);
}

function onFace({ role, facing }) {
  if (!partyIsHost()) return;
  const player = shared.players[role];
  player.facing = facing;
}

function onMove({ role, dX, dY }) {
  if (!partyIsHost()) return;
  const player = shared.players[role];

  const newX = player.x + dX;
  const newY = player.y + dY;

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
    const otherSideWall = shared.map[newX + dX][newY + dY];
    const otherSideGuest = Object.values(shared.players).some(
      (g) => g.x === newX + dX && g.y === newY + dY
    );
    const otherSideItem = shared.items.some(
      (item) => item.x === newX + dX && item.y === newY + dY && blocksPush(item)
    );
    const otherSideBlocked = otherSideWall || otherSideGuest || otherSideItem;
    // reject pushing blocked
    if (crate && otherSideBlocked) return;

    // push crate
    crate.x += dX;
    crate.y += dY;
  }

  // move the player
  player.x = newX;
  player.y = newY;
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
  // todo, only needs to be checked if player or treasure moves
  const treasures = itemsOfType("treasure");
  for (const treasure of treasures) {
    for (const player of players()) {
      if (player.x === treasure.x && player.y === treasure.y) {
        treasure.remove = true;
        player.score++;
      }
    }
  }

  // operate floor switches
  // todo, only needs to be checked if player or crate or floor switch moves
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
