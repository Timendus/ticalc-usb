// Module under test
const player = require('../../src/webusb/player');

// WebUSB filters
const filters = [
  {
    vendorId: 0x0451,
    productId: 0xe003
  }
];

const requestDeviceSteps = [
  {
    action: 'asyncFunctionCall',
    name: 'requestDevice',
    parameters: [ { filters } ],
    resolve: {
      open: () => 'This should not be called',
      myProp: 'hello',
      myUnknownProp: 'good things',
      vendorId: 0x0451,
      productId: 0xe003
    }
  },
  // Why on Earth this access to 'then'..?
  {
    action: 'propertyAccess',
    name: 'then',
    result: undefined
  }
];

describe('WebUSB Player', () => {

  describe('the main WebUSB object', () => {

    let replay;
    beforeEach(() => {
      replay = player(requestDeviceSteps);
    });

    it('replays calls to requestDevice', async () => {
      const device = await replay.requestDevice({ filters });
    });

    it("does not find devices that we don't ask for", async () => {
      expect.assertions(1);
      try {
        await replay.requestDevice({
          filters: [
            {
              vendorId: 0x0451,
              productId: 0xf003
            }
          ]
        });
      } catch(e) {
        expect(e.message).toEqual('No devices found');
      }
    });

    it('tells us that getDevices is not yet supported', async () => {
      expect.assertions(1);
      try {
        await replay.getDevices({ filters });
      } catch(e) {
        expect(e).toEqual('Replays of getDevices not yet implemented');
      }
    });

  });

  describe('device object', () => {

    describe('obtained through requestDevice', () => {

      it('can handle functions', async () => {
        const { replay, device } = await replayRequestDevice([
          {
            action: 'functionCall',
            name: 'open',
            parameters: [ 2, 3 ],
            result: [ 2, 3, 5 ]
          }
        ]);
        expect(device.open(2, 3)).toEqual([ 2, 3, 5 ]);
        expect(replay.unplayedSteps().length).toBe(0);
      });

      it('can handle async functions that resolve', async () => {
        const { replay, device } = await replayRequestDevice([
          {
            action: 'asyncFunctionCall',
            name: 'open',
            parameters: [ 2, 3 ],
            resolve: {
              input1: 2,
              input2: 3
            }
          }
        ]);
        expect(await device.open(2, 3)).toEqual({
          input1: 2,
          input2: 3
        });
        expect(replay.unplayedSteps().length).toBe(0);
      });

      it('can handle async functions that reject', async () => {
        const { replay, device } = await replayRequestDevice([
          {
            action: 'asyncFunctionCall',
            name: 'open',
            parameters: [ 2, 3 ],
            reject: 'bad'
          }
        ]);
        await expect(device.open(2, 3)).rejects.toEqual('bad');
        expect(replay.unplayedSteps().length).toBe(0);
      });

      it('can handle property reads', async () => {
        const { replay, device } = await replayRequestDevice([
          {
            action: 'propertyAccess',
            name: 'myProp',
            result: 'hello'
          }
        ]);
        expect(device.myProp).toEqual('hello');
        expect(replay.unplayedSteps().length).toBe(0);
      });

      it('can handle property access that is not in the replay, but available on the object', async () => {
        console.log = jest.fn();
        const { replay, device } = await replayRequestDevice([]);
        expect(device.myUnknownProp).toEqual('good things');
        expect(replay.unplayedSteps().length).toBe(0);
        expect(console.log).toHaveBeenCalledWith("Warning: Unlogged read of property 'myUnknownProp', value:", 'good things');
      });

      it('throws an error on access of a non-existant property', async () => {
        expect.assertions(2);
        const { replay, device } = await replayRequestDevice([]);
        try {
          expect(device.myNonExistantProp).toEqual('we never get here');
        } catch(e) {
          expect(e).toMatchObject({
            name: 'ReplayError',
            message: "The application expected there to be at least 1 steps for 'prop(s) myNonExistantProp'."
          });
          expect(replay.unplayedSteps().length).toBe(0);
        }
      });

      it('throws an error when a function is in the replay but a property is asked for', async () => {
        expect.assertions(2);
        const { replay, device } = await replayRequestDevice([
          {
            action: 'functionCall',
            name: 'badFunction',
            parameters: [ 2, 3 ],
            result: [ 2, 3, 5 ]
          }
        ]);
        try {
          expect(device.badFunction).toEqual('we never get here');
        } catch(e) {
          expect(e).toMatchObject({
            name: 'ReplayError',
            message: "The application accessed unknown property 'badFunction'."
          });
          expect(replay.unplayedSteps().length).toBe(1);
        }
      });

    });

  });

});

async function replayRequestDevice(steps) {
  const replay = player([
    ...requestDeviceSteps,
    ...steps
  ]);
  return {
    replay,
    device: await replay.requestDevice({ filters })
  };
}
