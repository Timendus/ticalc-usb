const replay = require('../helpers/replay');
let calculator;

describe('TI-84 Plus support', () => {

  beforeAll(() =>
    replay.load('./test/calculators/ti84p.replay.json')
          .then(calc => calculator = calc)
  );

  describe('the device', () => {
    it('is recognized as a TI-84 Plus', () => {
      // This is an insufficient test because it is taken
      // from the USB device, we need to fix that:
      expect(calculator.name).toEqual('TI-84 Plus');
    });

    it('is handled by the Ti84series class', () => {
      expect(calculator.constructor.name).toEqual('Ti84series');
    });

    it('has a buffer size of 250 bytes', () => {
      expect(calculator._d._bufferSize).toEqual(250);
    });
  });

  describe('communicating through USB', () => {
    it('is ready', async () => {
      expect(await calculator.isReady()).toBe(true);
    });

    it('gets the amount of free memory', async () => {
      expect(await calculator.getFreeMem()).toEqual({
        ram:   23407,
        flash: 415043
      });
    });
  });

  describe('the replay', () => {
    it('has no unplayed steps left over', () => {
      expect(replay.unplayedSteps()).toEqual([]);
    });
  });

});
