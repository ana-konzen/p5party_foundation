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

  // create the openings
  for (let row = 0; row < rows - 1; row += 8) {
    for (let col = 0; col < cols - 1; col += 8) {
      // set(map, col + 4, row, false);
      set(map, col, row + 4, false);
    }
  }

  // create outer border
  frame(map, 0, 0, cols, rows, true);

  // create starting blocks
  set(map, 1, 4, true);
  // create items

  // place the treasure
  // for (let row = 0; row < rows - 1; row += 8) {
  //   for (let col = 0; col < cols - 1; col += 8) {
  //     addItem("treasure", col + 4, row + 4);
  //   }
  // }

  // const door1 = addItem("door", 8, 4);
  // addItem("floorSwitch", 7, 3, { targets: [door1.id] });

  // addItem("crate", 6, 4);
  // addItem("crate", 6, 5);
  // addItem("unknown", 1, 1);

  // addItem("treasure", 1, 3);
  // addItem("treasure", 1, 4);

  // place the crates
  // for (let row = 0; row < rows - 1; row += 8) {
  //   for (let col = 0; col < cols - 1; col += 8) {
  //     //  c
  //     // ctc
  //     //  c
  //     addItem("crate", col + 3, row + 4);
  //     addItem("crate", col + 5, row + 4);
  //     addItem("crate", col + 4, row + 3);
  //     addItem("crate", col + 4, row + 5);

  //     // scatter some more
  //     for (let x = 0 + 2; x < 8 - 1; x++) {
  //       for (let y = 0 + 2; y < 8 - 1; y++) {
  //         if (x === 4 && y === 4) continue;
  //         if (Math.random() < 0.8) continue;
  //         if (!items.some((c) => c.x === col + x && c.y === row + y)) {
  //           addItem("crate", col + x, row + y);
  //         }
  //       }
  //     }
  //   }
  // }

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
