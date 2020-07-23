#!/usr/bin/env node

const player = require("../../src/webusb/player");
const { ticalc } = require("../../src");
const replay = require('./recording.json');

ticalc.addEventListener('connect', async calc => {
  if ( await calc.isReady() ) {
    const memFree = await calc.getFreeMem();
    console.log(memFree);
  } else {
    console.error("Replay should never get here");
  }
});

async function start() {
  try {
    await ticalc.choose({
      usb: player(replay, {
        verbose: false
      })
    });
  } catch(e) {
    console.error("Replay failed with this error:");
    console.error(e);
  }
}

start();
