const replay = require('../helpers/replay');
const TI83PCE = require('../../src/calculators/ez80/ti83pce');
let calculator;

describe('TI-83 Premium CE support', () => {

  beforeAll(async () => {
    calculator = await replay.load({
      calculator: TI83PCE,
      replay: './test/calculators/ti83pce.replay.json'
    });
  });

  describe('the device', () => {
    it('is recognized as a TI-83 Premium CE', () => {
      // This is an insufficient test because it is taken
      // from the USB device, we need to fix that:
      expect(calculator.name).toEqual('TI-83 Premium CE');
    });

    it('is handled by the EZ80series class', () => {
      expect(calculator.constructor.name).toEqual('EZ80series');
    });

    it('has a buffer size of 1023 bytes', () => {
      expect(calculator._d._bufferSize).toEqual(1023);
    });
  });

  describe('communicating through USB', () => {
    it('is ready', async () => {
      expect(await calculator.isReady()).toBe(true);
    });

    it('gets the amount of free memory', async () => {
      expect(await calculator.getFreeMem()).toEqual({
        ram:   undefined,
        flash: 2839309
      });
    });

    it('gets the directory', async () => {
      expect(await calculator.getDirectory()).toEqual([
        { name: 'Y', size: 9, type: 0, archived: false },
        { name: 'X', size: 9, type: 0, archived: false },
        { name: 'L₁', size: 2, type: 1, archived: false },
        { name: 'L₂', size: 2, type: 1, archived: false },
        { name: 'L₃', size: 2, type: 1, archived: false },
        { name: 'L₄', size: 2, type: 1, archived: false },
        { name: 'L₅', size: 2, type: 1, archived: false },
        { name: 'L₆', size: 2, type: 1, archived: false },
        { name: 'LibLoad', size: 981, type: 21, archived: true },
        { name: 'KEYPADC', size: 103, type: 21, archived: true },
        { name: 'FONTLIBC', size: 2507, type: 21, archived: true },
        { name: 'FILEIOC', size: 2693, type: 21, archived: true },
        { name: 'GRAPHX', size: 11366, type: 21, archived: true },
        { name: 'CESIUM', size: 25949, type: 6, archived: true },
        { name: 'PRGM', size: 4, type: 5, archived: false },
        { name: 'CabriJr', size: 102513, type: 36, archived: true }
      ]);
    });
  });

  describe('the replay', () => {
    it('has no unplayed steps left over', () => {
      expect(replay.unplayedSteps()).toEqual([]);
    });
  });

});
