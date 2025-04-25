import { CONFIG } from "./config.js";
import { shared } from "./host.js";
import { makeId, getValueAtPath } from "./util/utilities.js";
import { assets } from "./playScene.js";
import { draw } from "./titleScene.js";
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
  push();
  imageMode(CENTER);

  // draw the asset at the path provided, fall back to this.assetPath
  const img = getValueAtPath(assets, assetPath ?? this.assetPath, assets.missingImage);

  const imgRatio = img.width / img.height;
  const imgW = CONFIG.grid.width;
  const imgH = CONFIG.grid.width / imgRatio;
  image(
    img,
    this.x * CONFIG.grid.width + CONFIG.grid.width / 2,
    this.y * CONFIG.grid.height + CONFIG.grid.height / 2,
    imgW,
    imgH
  );
  pop();
};

const crateTemplate = {
  type: "crate",
  hits: 0,
  alpha: 255,
  z: 2,
  mapSymbol: "▢",

  draw: drawAsset,

  assetPath: "items.crate.0",

  init: function () {
    console.log("init CRATE", this);
    this.assetPath = "items.crate.1";
  },

  blocksPush: function () {
    return true;
  },
};

const waterTemplate = {
  type: "water",
  hits: 0,
  size: 56,
  shape: "rect",
  color: "#006",
  alpha: 255,
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
  size: 16,
  shape: "ellipse",
  color: "yellow",
  z: -1,
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
  state: "closed",
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
  size: 48,
  mapSymbol: "↑",

  assetPath: "items.stairs",
  draw: drawAsset,
};

const bulletTemplate = {
  type: "bullet",
  size: 16,
  color: "gray",
  mapSymbol: false,
  z: 2,

  draw: function () {
    this.assetPath = `items.bullet.${this.state}`;
    drawAsset.call(this);
  },
  state: "player1",
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

  // sort items by z. undefined zs default to 0
  // sort on copy of array to avoid mutating shared object
  // sort also from top to bottom based on y
  const sortedItems = [...items].sort((a, b) => {
    const aZ = a.z ?? 0;
    const bZ = b.z ?? 0;
    if (aZ === bZ) {
      return a.y - b.y;
    }
    return aZ - bZ;
  });
  for (const item of sortedItems) {
    // don't draw items flagged to remove
    if (item.remove) continue;
    drawItem(item);
  }
  pop();
}
