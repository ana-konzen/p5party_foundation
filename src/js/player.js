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

export function update() {
  if (controls.up.pressed) {
    partyEmit("face", { role: roleKeeper.myRole(), facing: "up" });
    partyEmit("move", { role: roleKeeper.myRole(), dX: 0, dY: -1 });
  }
  if (controls.down.pressed) {
    partyEmit("face", { role: roleKeeper.myRole(), facing: "down" });
    partyEmit("move", { role: roleKeeper.myRole(), dX: 0, dY: 1 });
  }
  if (controls.left.pressed) {
    partyEmit("face", { role: roleKeeper.myRole(), facing: "left" });
    partyEmit("move", { role: roleKeeper.myRole(), dX: -1, dY: 0 });
  }
  if (controls.right.pressed) {
    partyEmit("face", { role: roleKeeper.myRole(), facing: "right" });
    partyEmit("move", { role: roleKeeper.myRole(), dX: 1, dY: 0 });
  }
  if (controls.shoot.pressed) {
    partyEmit("shoot", { role: roleKeeper.myRole() });
  }

  controls.tick();
}
