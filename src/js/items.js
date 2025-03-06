import { CONFIG } from "./config.js";
import { shared } from "./host.js";
import { makeId } from "./util/utilities.js";

const itemTemplate = {
  id: "",
  type: "item",
  x: 0,
  y: 0,
  z: 0,
  size: 60,
  shape: "rect",
  color: "magenta",
  alpha: 255,
  draw: function () {
    push();
    ellipseMode(CENTER);
    rectMode(CENTER);
    const itemColor = color(this.color);
    itemColor.setAlpha(this.alpha);
    fill(itemColor);

    const shapeFunction = this.shape === "rect" ? rect : ellipse;
    shapeFunction(
      this.x * CONFIG.grid.size + CONFIG.grid.size / 2,
      this.y * CONFIG.grid.size + CONFIG.grid.size / 2,
      this.size
    );
    pop();
  },
};

const crateTemplate = {
  // ...itemTemplate,
  type: "crate",
  hits: 0,
  size: 56,
  shape: "rect",
  color: "brown",
  alpha: 255,
  z: 1,
  blocksPush: function () {
    return true;
  },
};

const treasureTemplate = {
  // ...itemTemplate,
  type: "treasure",
  size: 16,
  shape: "ellipse",
  color: "yellow",
  z: -1,
  blocksPush: function () {
    return true;
  },
};

const doorTemplate = {
  // ...itemTemplate,
  type: "door",
  open: false,
  size: 56,
  shape: "rect",
  color: "#335",
  blocksMove: function () {
    return !this.open;
  },
  blocksPush: function () {
    return !this.open;
  },
  draw: function () {
    if (this.open) return;
    itemTemplate.draw.call(this);
  },
};

const floorSwitchTemplate = {
  // ...itemTemplate,
  type: "floorSwitch",
  targets: [],
  size: 48,
  shape: "ellipse",
  color: "#335",
};

const bulletTemplate = {
  // ...itemTemplate,
  type: "bullet",
  size: 16,
  color: "gray",
  z: 2,
};

const templates = {
  crate: crateTemplate,
  treasure: treasureTemplate,
  door: doorTemplate,
  floorSwitch: floorSwitchTemplate,
  bullet: bulletTemplate,
};

export function createItem(type, x, y, options = {}) {
  // if (!templates[type]) {
  //   throw new Error(`Could not create item of unknown type: ${type}`);
  // }

  const item = {
    id: makeId(),
    type,
    x,
    y,
    ...options,
  };

  return item;
}

export function blocksMove(item) {
  item = { ...itemTemplate, ...templates[item.type], ...item };
  // Object.setPrototypeOf(item, templates[item.type]);
  return item.blocksMove?.() ?? false;
}

export function blocksPush(item) {
  item = { ...itemTemplate, ...templates[item.type], ...item };
  return item.blocksPush?.() ?? false;
}

export function drawItem(item) {
  item = { ...itemTemplate, ...templates[item.type], ...item };
  item.draw();
}

export function itemsOfType(type) {
  return shared.items.filter((g) => g.type === type);
}

export function drawItems(items) {
  push();

  // sort items by z. undefined zs default to 0
  // sort on copy of array to avoid mutating shared object
  const sortedItems = [...items].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
  for (const item of sortedItems) {
    // don't draw items flagged to remove
    if (item.remove) continue;
    drawItem(item);
  }
  pop();
}
