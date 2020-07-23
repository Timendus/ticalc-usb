#!/usr/bin/env node

const fs = require('fs');
const Player = require("../../src/webusb/player");
const { ticalc } = require("../../src");
const filename = process.argv[2];
const replay = JSON.parse(fs.readFileSync(filename, 'utf8'));
const player = Player(replay, {
  verbose: false
});

ticalc.addEventListener('connect', async calc => {
  if ( await calc.isReady() ) {
    const memFree = await calc.getFreeMem();
    console.log(memFree);
    if ( player.unplayedSteps().length > 0 )
      console.log(`Warning: there are ${player.unplayedSteps().length} unplayed step(s) left in the replay`);
  } else {
    console.error("Replay should never get here");
  }
});

ticalc.choose({ usb: player })
  .catch(err => {
    console.error("Replay failed with this error:");
    console.error(err);
  });
