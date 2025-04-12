import { Controls } from "./util/controls.js";
import { roleKeeper } from "./playScene.js";

const controls = new Controls();
controls.bind("ArrowUp", "up");
controls.bind("w", "up");
controls.bind("ArrowDown", "down");
controls.bind("s", "down");
controls.bind("ArrowLeft", "left");
controls.bind("a", "left");
controls.bind("ArrowRight", "right");
controls.bind("d", "right");
controls.bind(" ", "shoot");

export function reset() {
  controls.tick();
}
export function update() {
  const role = roleKeeper.myRole();
  if (role === "unassigned") return;

  if (controls.up.pressed) {
    partyEmit("face", { role, facing: "up" });
    partyEmit("move", { role, dX: 0, dY: -1 });
  }
  if (controls.down.pressed) {
    partyEmit("face", { role, facing: "down" });
    partyEmit("move", { role, dX: 0, dY: 1 });
  }
  if (controls.left.pressed) {
    partyEmit("face", { role, facing: "left" });
    partyEmit("move", { role, dX: -1, dY: 0 });
  }
  if (controls.right.pressed) {
    partyEmit("face", { role, facing: "right" });
    partyEmit("move", { role, dX: 1, dY: 0 });
  }
  if (controls.shoot.pressed) {
    partyEmit("shoot", { role });
  }

  controls.tick();
}
