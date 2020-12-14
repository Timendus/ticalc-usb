const EZ80series = require('../../src/dusb/ez80series');
const Ti84series = require('../../src/dusb/ti84series');

describe('EZ80series class', () => {

  describe('getFreeMem', () => {

    it('interprets zero free RAM as "I don\'t know 🤷🏼‍♀️"', async () => {
      // Make sure the super class returns zero ram
      Ti84series.prototype.getFreeMem = () => Promise.resolve({
        ram:   0,
        flash: 200
      });

      const calculator = new EZ80series({});
      const memory = await calculator.getFreeMem();

      expect(memory.ram).toBe(undefined);
      expect(memory.ram).not.toBe(0);
      expect(memory.flash).toBe(200);
    });

    it('leaves other values alone', async () => {
      // Make sure the super class returns 100 ram
      Ti84series.prototype.getFreeMem = () => Promise.resolve({
        ram:   100,
        flash: 200
      });

      const calculator = new EZ80series({});
      const memory = await calculator.getFreeMem();

      expect(memory.ram).toBe(100);
      expect(memory.flash).toBe(200);
    });

  });

});
