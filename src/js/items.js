import { CONFIG } from "./config.js";
import { shared } from "./host.js";
import { makeId, randomInt } from "./util/utilities.js";
import * as assets from "./assets.js";

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
  mapSymbol: "?",
  assetPath: undefined,

  state: null,

  draw: function () {
    push();
    ellipseMode(CENTER);
    rectMode(CENTER);
    const itemColor = color(this.color);
    itemColor.setAlpha(this.alpha);
    fill(itemColor);

    const shapeFunction = this.shape === "rect" ? rect : ellipse;
    shapeFunction(
      this.x * CONFIG.grid.width + CONFIG.grid.width / 2,
      this.y * CONFIG.grid.height + CONFIG.grid.height / 2,
      this.size
    );
    pop();
  },
  init: function () {
    console.log("init item", this.type);
  },
};

const drawAsset = function (assetPath) {
  if (!this.assetPath) return;
  assets.addToQueue({
    path: assetPath ?? this.assetPath,
    x: this.x,
    y: this.y,
    z: this.z ?? 0,
    yOffset: this.yOffset ?? 0,
  });
};

const crateTemplate = {
  type: "crate",
  hits: 0,
  alpha: 255,
  z: 2,
  yOffset: -CONFIG.grid.height,
  mapSymbol: "▢",

  init: function () {
    console.log("init CRATE", this);
    this.assetPath = `items.crate.${randomInt(2)}`;
  },

  draw: drawAsset,

  assetPath: "items.crate.1",

  blocksPush: function () {
    return true;
  },
};

const waterTemplate = {
  type: "water",
  hits: 0,
  z: 1,
  mapSymbol: "≈",

  draw: drawAsset,
  assetPath: "items.water",

  blocksMove: function () {
    return true;
  },
  blocksPush: function () {
    return true;
  },
};

const treasureTemplate = {
  type: "treasure",
  mapSymbol: "$",
  draw: drawAsset,
  assetPath: "items.treasure",
  blocksPush: function () {
    return true;
  },
};

const doorTemplate = {
  type: "door",
  open: false,
  group: "",
  yOffset: -CONFIG.grid.height * 2,
  draw: function () {
    this.assetPath = `items.door.${this.open ? "open" : "closed"}`;
    drawAsset.call(this);
  },
  mapSymbol: function () {
    return this.group.toUpperCase();
  },
  blocksMove: function () {
    return !this.open;
  },
  blocksPush: function () {
    return !this.open;
  },
};

const floorSwitchTemplate = {
  type: "floorSwitch",
  group: "",
  state: "up",

  draw: function () {
    this.assetPath = `items.floorSwitch.${this.state}`;
    drawAsset.call(this);
  },

  mapSymbol: function () {
    return this.group;
  },
};

const stairsTemplate = {
  type: "stairs",
  mapSymbol: "↑",
  assetPath: "items.stairs",
  draw: drawAsset,
};

const bulletTemplate = {
  type: "bullet",
  mapSymbol: false,
  z: 2,
  draw: function () {
    this.assetPath = `items.bullet.${this.player}`;
    drawAsset.call(this);
  },
  player: "player1",
};

const templates = {
  crate: crateTemplate,
  treasure: treasureTemplate,
  door: doorTemplate,
  floorSwitch: floorSwitchTemplate,
  bullet: bulletTemplate,
  stairs: stairsTemplate,
  water: waterTemplate,
};

export function typeForSymbol(symbol) {
  for (const [type, template] of Object.entries(templates)) {
    if (template.mapSymbol === symbol) return type;
  }
  return false;
}

export function createItem(type, x, y, options = {}) {
  const item = {
    id: makeId(),
    type,
    x,
    y,
    ...options,
  };

  initItem(item);

  return item;
}

export function initItem(item) {
  item = { ...itemTemplate, ...templates[item.type], ...item };
  item.init();
}

export function expand(item) {
  return { ...itemTemplate, ...templates[item.type], ...item };
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
  // todo (item.draw || templates[item.type].draw || itemTemplate.draw)()
  item = { ...itemTemplate, ...templates[item.type], ...item };
  item.draw();
}

export function itemsOfType(type) {
  return shared.items.filter((g) => g.type === type);
}

export function drawItems(items) {
  push();

  for (const item of items) {
    // don't draw items flagged to remove
    if (item.remove) continue;
    drawItem(item);
  }
  pop();
}
