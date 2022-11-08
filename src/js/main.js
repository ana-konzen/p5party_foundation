/**
 * main.js
 *
 * This is the entry point for the game. It doesn't do much itself, but rather
 * loads the other modules, sets things up, and coordinates the main game
 * scenes.
 *
 * A major organizing prinicple of this code is that it is organized into
 * "scenes". See sceneTemplate.js for more info.
 *
 * main.js exports a function changeScene() that scenes can use to switch to
 * other scenes.
 *
 */

import * as titleScene from "./titleScene.js";
import * as playScene from "./playScene.js";

var currentScene; // the scene being displayed
// all the available scenes
export let scenes = {
  title: titleScene,
  play: playScene,
};

// p5.js auto detects your setup() and draw() before "installing" itself but
// since this code is a module the functions aren't global. This creates aliases
// of the p5 functions on window, so p5.js can find them
Object.assign(window, {
  preload,
  draw,
  setup,
  mousePressed,
});

function preload() {
  Object.values(scenes).forEach((scene) => scene.preload?.());
}

function setup() {
  createCanvas(512, 512);
  noFill();
  noStroke();

  Object.values(scenes).forEach((scene) => scene.setup?.());
  changeScene(scenes.title);
}

function draw() {
  // update
  currentScene?.update?.();

  // draw
  currentScene?.draw?.();
}

function mousePressed() {
  currentScene?.mousePressed?.();
}

export function changeScene(newScene) {
  if (!newScene) {
    console.error("newScene not provided");
    return;
  }
  if (newScene === currentScene) {
    console.error("newScene is already currentScene");
    return;
  }
  currentScene?.leave?.();
  currentScene = newScene;
  currentScene.enter?.();
}
