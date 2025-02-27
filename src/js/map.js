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
      addItem({ x: col + 4, y: row + 4, type: "treasure" });
    }
  }

  const door1Id = makeId();
  const door2Id = makeId();
  const door3Id = makeId();
  addItem({ x: 8, y: 4, type: "door", id: door1Id });
  addItem({ x: 4, y: 8, type: "door", id: door2Id });
  addItem({ x: 12, y: 8, type: "door", id: door3Id });
  addItem({ x: 7, y: 3, type: "floorSwitch", targets: [door1Id, door3Id] });
  addItem({ x: 9, y: 7, type: "floorSwitch", targets: [door2Id] });

  // place the crates
  for (let row = 0; row < rows - 1; row += 8) {
    for (let col = 0; col < cols - 1; col += 8) {
      //  c
      // ctc
      //  c
      addItem({ x: col + 3, y: row + 4, type: "crate" });
      addItem({ x: col + 5, y: row + 4, type: "crate" });
      addItem({ x: col + 4, y: row + 3, type: "crate" });
      addItem({ x: col + 4, y: row + 5, type: "crate" });

      // scatter some more
      for (let x = 0 + 2; x < 8 - 1; x++) {
        for (let y = 0 + 2; y < 8 - 1; y++) {
          if (x === 4 && y === 4) continue;
          if (Math.random() < 0.8) continue;
          if (!items.some((c) => c.x === col + x && c.y === row + y)) {
            addItem({ x: col + x, y: row + y, type: "crate" });
          }
        }
      }
    }
  }
  function addItem({ x, y, type, id, z, hits, color, alive, blocking, targets }) {
    const props = {
      crate: {
        size: 56,
        shape: "rect",
        hits: hits ?? 0,
        alive: alive ?? true,
        color: color ?? "brown",
        alpha: 255,
        z: z ?? 1,
      },
      treasure: {
        size: 16,
        shape: "ellipse",
        alive: alive ?? true,
        color: color ?? "yellow",
        z: z ?? -1,
      },
      door: {
        color: color ?? "#335",
        size: 56,
        shape: "rect",
        blocking: blocking ?? true,
      },
      floorSwitch: {
        color: color ?? "#335",
        size: 48,
        shape: "ellipse",
        targets: targets ?? [],
      },
    };
    items.push({
      x,
      y,
      type,
      id: id ?? makeId(),
      ...props[type],
    });
  }
  // sort items by z. if z is undefined, it will be treated as 0
  items.sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
  console.log(items);

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
  if (x < 0 || x >= map[0].length || y < 0 || y >= map.length) return;
  map[y][x] = value;
}
