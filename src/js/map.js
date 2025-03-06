import { createArray2D } from "./util/utilities.js";
import { createItem } from "./items.js";

export function generateMap(cols, rows) {
  function addItem(/* type, x, y, options */) {
    const item = createItem(...arguments);
    if (item) items.push(item);
    return item;
  }

  // init blocks
  const map = createArray2D(cols, rows, false);
  const items = [];

  // frame the rooms
  for (let row = 0; row < rows - 1; row += 8) {
    for (let col = 0; col < cols - 1; col += 8) {
      console.log("frame", col, row);
      frame(map, col, row, 9, 9);
    }
  }

  // room 1 door puzzle
  const door1 = addItem("door", 8, 4);
  addItem("floorSwitch", 7, 3, { targets: [door1.id] });
  set(map, 8, 4, false);
  addItem("crate", 9, 3);

  // room 2-3 doors
  set(map, 16, 2, false);
  set(map, 16, 6, false);

  // room 3
  set(map, 17, 4, true);
  set(map, 18, 4, true);
  addItem("crate", 19, 3);
  addItem("crate", 19, 4);
  addItem("crate", 19, 5);
  set(map, 20, 2, true);
  addItem("treasure", 20, 4);
  set(map, 20, 6, true);
  set(map, 21, 3, true);
  set(map, 21, 4, true);
  set(map, 21, 5, true);
  set(map, 22, 4, true);
  set(map, 23, 4, true);

  // room 3-4 doors
  set(map, 24, 2, false);
  set(map, 24, 6, false);

  // room 4
  addItem("stairs", 31, 4);

  return { map, items };
}

function frame(map, l, t, w, h, value = true) {
  // draw horizontal walls
  for (let x = l; x < l + w; x++) {
    set(map, x, t, value);
    set(map, x, t + h - 1, value);
  }
  // draw vertical walls
  for (let y = t + 1; y < t + h - 1; y++) {
    set(map, l, y, value);
    set(map, l + w - 1, y, value);
  }
}

function set(map, x, y, value) {
  if (x < 0 || x >= map.length || y < 0 || y >= map[0].length) {
    console.log("reject", x, y, map);
    return;
  }
  map[x][y] = value;
}
