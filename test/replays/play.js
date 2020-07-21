#!/usr/bin/env node

const player = require("../../src/webusb/player");
const { ticalc } = require("../../src");
const replay = require('./test1.json');

ticalc.addEventListener('connect', async calc => {
  if ( await calc.isReady() ) {
    const memFree = await calc.getFreeMem();
    console.log(memFree);
  } else {
    console.error("Calculator is not responding or not ready");
  }
});

async function start() {
  try {
    await ticalc.choose({
      usb: player(replay, {
        verbose: true
      })
    });
  } catch(e) {
    console.error("Could not connect to a device. Are you sure any TI calculator is connected?");
    console.error(e);
  }
}

start();
