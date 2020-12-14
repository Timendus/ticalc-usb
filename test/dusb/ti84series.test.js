const Ti84series = require('../../src/dusb/ti84series');
let calculator;

describe('Ti84series class', () => {

  beforeAll(() => {
    calculator = new Ti84series({
      device: {
        requestDevice: () => Promise.resolve()
      },
      properties: {
        name: 'Testing calculator',
        compatibleFiles: [ 'type1', 'type2' ]
      }
    });
  });

  it('instantiates properly', () => {
    expect(calculator.constructor.name).toEqual('Ti84series');
    expect(calculator.name).toEqual('Testing calculator');
  });

  describe('canReceive', () => {
    it('allows types on the list', () => {
      expect(calculator.canReceive({ calcType: 'type1' })).toBe(true);
    });
    it('does not allow types not on the list', () => {
      expect(calculator.canReceive({ calcType: 'type3' })).toBe(false);
    });
  });

  describe('getStorageDetails', () => {

    const file = {
      entries: [
        { size: 100, attributes: { archived: false } },
        { size: 200, attributes: { archived: false } },
        { size: 300, attributes: { archived: true  } },
        { size: 400, attributes: { archived: true  } }
      ]
    };

    beforeAll(() => {
      calculator.getFreeMem = () => ({ ram: 100, flash: 200 });
    });

    it('sums up ram and flash requirements', async () => {
      const details = await calculator.getStorageDetails(file);
      expect(details.required.ram).toBe(300);
      expect(details.required.flash).toBe(700);
    });

    it('proxies the amount of free memory', async () => {
      const details = await calculator.getStorageDetails(file);
      expect(details.free.ram).toBe(100);
      expect(details.free.flash).toBe(200);
    });

    it('tells us if the required space fits in the available space', async () => {
      calculator.getFreeMem = () => ({ ram: 299, flash: 699 });
      let details = await calculator.getStorageDetails(file);
      expect(details.fits).toBe(false);

      calculator.getFreeMem = () => ({ ram: 299, flash: 700 });
      details = await calculator.getStorageDetails(file);
      expect(details.fits).toBe(false);

      calculator.getFreeMem = () => ({ ram: 300, flash: 699 });
      details = await calculator.getStorageDetails(file);
      expect(details.fits).toBe(false);

      calculator.getFreeMem = () => ({ ram: 300, flash: 700 });
      details = await calculator.getStorageDetails(file);
      expect(details.fits).toBe(true);
    });

    it('treats `undefined` as "probably enough space" 😌', async () => {
      calculator.getFreeMem = () => ({ ram: undefined, flash: 700 });
      const details = await calculator.getStorageDetails(file);
      expect(details.fits).toBe(true);
    });

  });

});
