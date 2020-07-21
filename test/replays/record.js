#!/usr/bin/env node

const fs = require('fs');
const usb = require("webusb").usb;
const recorder = require("../../src/webusb/recorder");
const recording = recorder(usb);
const { ticalc } = require("../../src");

ticalc.addEventListener('connect', async calc => {
  if ( await calc.isReady() ) {
    const memFree = await calc.getFreeMem();
    console.log(memFree);
    fs.writeFile('recording.json', JSON.stringify(recording.getSteps()), err => {
      if (err) return console.error(err);
      console.log("Wrote recording to recording.json");
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
