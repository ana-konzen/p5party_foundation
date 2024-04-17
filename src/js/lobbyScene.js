import { changeScene, scenes } from "./main.js";

let me, guests;

let lobbyCount = 0;

export function preload() {
  console.log("lobbyScene preload");

  me = partyLoadMyShared({ name: random(), inLobby: false });
  guests = partyLoadGuestShareds();
}

export function setup() {
  console.log("lobbyScene setup");
}

export function enter() {
  console.log("lobbyScene enter");
  me.inLobby = true;

  console.log("me", JSON.stringify(me));
  console.log("guests", JSON.stringify(guests));
}

export function update() {
  lobbyCount = guests.filter((guest) => guest.inLobby).length;
  if (lobbyCount > 1) {
    changeScene(scenes.play);
  }
}

export function draw() {
  background("#330000");
  fill("white");

  let y = 20;
  for (const guest of guests) {
    text(`${guest.name}: ${guest.inLobby}`, 10, y);
    y += 20;
  }

  text(`lobby count: ${lobbyCount}`, 300, y);
}

export function mousePressed() {
  console.log("lobbyScene mousePressed");
}

export function leave() {
  console.log("lobbyScene leave");
  // wait 1 second before clearing the inLobby flag, to give other clients a chance to see it
  setTimeout(() => {
    me.inLobby = false;
  }, 1000);
}
