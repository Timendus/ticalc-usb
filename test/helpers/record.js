#!/usr/bin/env node

// This executable command line tool generates a replay file of a default set of
// interactions with a connected calculator.

const fs = require('fs');
const usb = require("webusb").usb;
const recorder = require("../../src/webusb/recorder");
const recording = recorder(usb);
const { ticalc } = require("../../src");
const filename = process.argv[2] || 'calc.replay.json';

ticalc.addEventListener('connect', async calc => {
  if ( await calc.isReady() ) {
    const memFree = await calc.getFreeMem();
    console.log(memFree);
    fs.writeFile(filename, JSON.stringify(recording.getSteps()), err => {
      if (err) return console.error(err);
      console.log(`Wrote recording to ${filename}`);
    });
  } else {
    console.error("Calculator is not responding or not ready");
  }
});

async function start() {
  try {
    await ticalc.choose({ usb: recording });
  } catch(err) {
    console.error("Could not connect to a device. Are you sure any TI calculator is connected?");
    console.error(err);
  }
}

start();
