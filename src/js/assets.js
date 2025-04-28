import { CONFIG } from "./config.js";
import { getValueAtPath } from "./util/utilities.js";

export const assets = {};

const assetsQueue = [];

export function preload() {
  assets.player1 = {
    left: loadImage("assets/player1/left.png"),
    right: loadImage("assets/player1/right.png"),
    up: loadImage("assets/player1/up.png"),
    down: loadImage("assets/player1/down.png"),
  };
  assets.player2 = {
    left: loadImage("assets/player2/left.png"),
    right: loadImage("assets/player2/right.png"),
    up: loadImage("assets/player2/up.png"),
    down: loadImage("assets/player2/down.png"),
  };
  assets.tiles = [
    loadImage("assets/tile_map/1.png"),
    loadImage("assets/tile_map/2.png"),
    loadImage("assets/tile_map/3.png"),
  ];
  assets.items = {
    crate: [loadImage("assets/crystals/1.png"), loadImage("assets/crystals/2.png")],
    door: { open: loadImage("assets/door/open.png"), closed: loadImage("assets/door/closed.png") },
    floorSwitch: {
      up: loadImage("assets/switch/up.png"),
      down: loadImage("assets/switch/down.png"),
    },
    bullet: {
      player1: loadImage("assets/bullets/player1.png"),
      player2: loadImage("assets/bullets/player2.png"),
    },
    water: loadImage("assets/water.png"),
    stairs: loadImage("assets/stairs/down.png"),
    treasure: loadImage("assets/treasure.png"),
  };
}

export function setup() {
  assets.walls = loadWalls();
}

export function addToQueue(imageInfo) {
  assetsQueue.push(imageInfo);
}

function sortQueue() {
  // sort images by z position if y is the same
  assetsQueue.sort((a, b) => {
    if (a.y === b.y) {
      const aZ = a.z ?? 0;
      const bZ = b.z ?? 0;
      return aZ - bZ;
    }
    return a.y - b.y;
  });
}

export function drawQueue() {
  sortQueue();
  push();
  imageMode(CENTER);
  for (const imageInfo of assetsQueue) {
    const { path, x, y } = imageInfo;
    const yOffset = imageInfo.yOffset ?? 0;
    const img = getValueAtPath(assets, path, assets.missingImage);
    const imgRatio = img.width / img.height;
    const imgW = CONFIG.grid.width;
    const imgH = CONFIG.grid.width / imgRatio;

    image(
      img,
      x * CONFIG.grid.width + CONFIG.grid.width / 2,
      y * CONFIG.grid.height + imgH / 2 + yOffset,
      imgW,
      imgH
    );
  }
  pop();
  assetsQueue.length = 0; // clear the queue
}

function loadWalls() {
  const walls = [];
  const score = 16;

  for (const tileMap of assets.tiles) {
    const wallSet = [];
    const imgWidth = tileMap.width / 4;
    const imgHeight = tileMap.height / 4;

    for (let i = 0; i < score; i++) {
      const sx = (i % 4) * imgWidth;
      const sy = floor(i / 4) * imgHeight;
      const wall = tileMap.get(sx, sy, imgWidth, imgHeight);
      wallSet.push(wall);
    }

    walls.push(wallSet);
  }

  return walls;
}
