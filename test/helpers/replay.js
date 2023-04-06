// This is a little test helper that initializes `ticalc` with a mock WebUSB
// object, loaded from the given replay file.

const fs = require('fs');
const player = require("../../src/webusb/player");
const { ticalc } = require("../../src");
let replayPlayer;

module.exports = {
  load: ({ calculator, replay }) => {
    return new Promise((resolve, reject) => {
      try {
        replay = JSON.parse(fs.readFileSync(replay, 'utf8'));
        replayPlayer = player(replay, { requiredMatcher: calculator.matcher });
        ticalc.setSupportLevel('experimental');
        ticalc.addEventListener('connect', calc => resolve(calc));
        ticalc.choose({ usb: replayPlayer })
              .catch(e => reject(e));
      } catch(e) {
        reject(e);
      }
    });
  },

  unplayedSteps: () => replayPlayer.unplayedSteps()
};
