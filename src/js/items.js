import { CONFIG } from "./config.js";
import { shared } from "./host.js";
import { makeId } from "./util/utilities.js";

export function createItem(type, x, y, options = {}) {
  const defaults = {
    crate: {
      hits: 0,
    },
    treasure: {},
    door: {
      blocking: true,
    },
    floorSwitch: {
      targets: [],
    },
  };

  if (!defaults[type]) {
    throw new Error(`Could not create item of unknown type: ${type}`);
  }

  const item = {
    id: makeId(),
    type,
    x,
    y,
    ...defaults[type],
    ...options,
  };

  return item;
}

export function drawItems(items) {
  push();

  // sort items by z. undefined zs default to 0
  // sort on copy of array to avoid mustating shared object
  const sortedItems = [...items].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
  for (const item of sortedItems) {
    // don't draw open doors
    if (item.type === "door" && item.open) continue;
    drawItem(item);
  }
  pop();
}

export function drawItem(item) {
  const defaults = {
    crate: {
      size: 56,
      shape: "rect",
      color: "brown",
      alpha: 255,
      z: 1,
    },
    treasure: {
      size: 16,
      shape: "ellipse",
      color: "yellow",
      z: -1,
    },
    door: {
      size: 56,
      shape: "rect",
      color: "#335",
    },
    floorSwitch: {
      size: 48,
      shape: "ellipse",
      color: "#335",
    },
    bullet: {
      size: 16,
      color: "gray",
      z: 2,
    },
  };

  if (!defaults[item.type]) {
    throw new Error(`Could not draw item of unknown type: ${item.type}`);
  }

  item = { ...defaults[item.type], ...item };

  push();
  ellipseMode(CENTER);
  rectMode(CENTER);
  const itemColor = color(item.color);
  itemColor.setAlpha(item.alpha ?? 255);
  fill(itemColor);

  const shapeFunction = item.shape === "rect" ? rect : ellipse;
  shapeFunction(
    item.x * CONFIG.grid.size + CONFIG.grid.size / 2,
    item.y * CONFIG.grid.size + CONFIG.grid.size / 2,
    item.size
  );
  pop();
}
export function itemsOfType(type) {
  return shared.items.filter((g) => g.type === type);
}
