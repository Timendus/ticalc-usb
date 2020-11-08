// This is a little test helper that initializes `ticalc` with a mock WebUSB
// object, loaded from the given replay file.

const fs = require('fs');
const player = require("../../src/webusb/player");
const { ticalc } = require("../../src");
let replay;

module.exports = {
  load: file => {
    return new Promise((resolve, reject) => {
      try {
        replay = player(JSON.parse(fs.readFileSync(file, 'utf8')));
        ticalc.addEventListener('connect', calc => resolve(calc));
        ticalc.choose({ usb: replay })
              .catch(e => reject(e));
      } catch(e) {
        reject(e);
      }
    });
  },

  unplayedSteps: () => replay.unplayedSteps()
};
