// This is a little test helper that initializes `ticalc` with a mock WebUSB
// object, loaded from the given replay file.

const fs = require('fs');
const Player = require("../../src/webusb/player");
const { ticalc } = require("../../src");
let player;

module.exports = {
  load: file => {
    return new Promise((resolve, reject) => {
      try {
        player = Player(JSON.parse(fs.readFileSync(file, 'utf8')));
        ticalc.addEventListener('connect', calc => resolve(calc));
        ticalc.choose({ usb: player });
      } catch(e) {
        reject(e);
      }
    });
  },

  unplayedSteps: () => player.unplayedSteps()
};
