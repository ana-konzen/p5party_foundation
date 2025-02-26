import { array2D, makeId } from "./utilities.js";

export function generateMap(cols, rows) {
  // init blocks
  const map = array2D(cols, rows, false);
  const items = [];

  // frame the rooms
  for (let row = 0; row < rows - 1; row += 8) {
    for (let col = 0; col < cols - 1; col += 8) {
      frame(map, col, row, 9, 9);
    }
  }

  // create the doors
  for (let row = 0; row < rows - 1; row += 8) {
    for (let col = 0; col < cols - 1; col += 8) {
      set(map, col + 4, row, false);
      set(map, col, row + 4, false);
    }
  }

  // create outer border
  frame(map, 0, 0, cols, rows, true);

  // create items

  // place the treasure
  for (let row = 0; row < rows - 1; row += 8) {
    for (let col = 0; col < cols - 1; col += 8) {
      items.push({
        x: col + 4,
        y: row + 4,
        type: "treasure",
        alive: true,
        id: makeId(),
      });
    }
  }

  const door1Id = makeId();
  const door2Id = makeId();
  const door3Id = makeId();
  items.push({ x: 8, y: 4, type: "door", blocking: true, id: door1Id });
  items.push({ x: 4, y: 8, type: "door", blocking: true, id: door2Id });
  items.push({ x: 12, y: 8, type: "door", blocking: true, id: door3Id });
  items.push({ x: 7, y: 3, type: "floor_switch", targets: [door1Id, door3Id], id: makeId() });
  items.push({ x: 9, y: 7, type: "floor_switch", targets: [door2Id], id: makeId() });

  // place the crates
  for (let row = 0; row < rows - 1; row += 8) {
    for (let col = 0; col < cols - 1; col += 8) {
      //  c
      // ctc
      //  c
      items.push({ x: col + 3, y: row + 4, type: "crate", alive: true, id: makeId() });
      items.push({ x: col + 5, y: row + 4, type: "crate", alive: true, id: makeId() });
      items.push({ x: col + 4, y: row + 3, type: "crate", alive: true, id: makeId() });
      items.push({ x: col + 4, y: row + 5, type: "crate", alive: true, id: makeId() });

      // scatter some more
      for (let x = 0 + 2; x < 8 - 1; x++) {
        for (let y = 0 + 2; y < 8 - 1; y++) {
          if (x === 4 && y === 4) continue;
          if (Math.random() < 0.8) continue;
          if (!items.some((c) => c.x === col + x && c.y === row + y)) {
            items.push({ x: col + x, y: row + y, type: "crate", alive: true, id: makeId() });
          }
        }
      }
    }
  }

  return { map, items };
}

function frame(map, l, t, w, h, value = true) {
  //   draw horizontal walls
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

function set(map, y, x, value) {
  if (x < 0 || x >= map[0].length || y < 0 || y >= map.length) return;
  map[y][x] = value;
}
