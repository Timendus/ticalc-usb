// Module under test
const recorder = require('../../src/webusb/recorder');

// Mock WebUSB object
const webUSB = {
  requestDevice: async options => ({
    myOptions: () => options,
    myFunc: (input1, input2) => [input1, input2, 5],
    myAsyncFunc: async (input1, input2) => ({ input1, input2 }),
    myRejectFunc: async (input1, input2) => { throw 'bad' },
    myProp: 'hello'
  }),
  getDevices: async options => [
    {
      myOptions: () => options,
      myFunc: (input1, input2) => [input1, input2, 5],
      myAsyncFunc: async (input1, input2) => ({ input1, input2 }),
      myRejectFunc: async (input1, input2) => { throw 'bad' },
      myProp: 'hello'
    }
  ]
};

// Some mock options to give our mock WebUSB object
const options = { some: 'options' };

const requestDeviceSteps = [
  {
    action: 'asyncFunctionCall',
    name: 'requestDevice',
    parameters: options,
    resolve: {
      myOptions: expect.any(Function),
      myFunc: expect.any(Function),
      myAsyncFunc: expect.any(Function),
      myProp: 'hello'
    }
  },
  // Why on Earth this access to 'then'..?
  {
    action: 'propertyAccess',
    name: 'then',
    result: undefined
  }
];

const getDevicesSteps = [
  {
    action: 'asyncFunctionCall',
    name: 'getDevices',
    parameters: [ options ],
    resolve: [
      {
        myOptions: expect.any(Function),
        myFunc: expect.any(Function),
        myAsyncFunc: expect.any(Function),
        myProp: 'hello'
      }
    ]
  }
];

describe('WebUSB Recorder', () => {

  describe('the main WebUSB object', () => {

    let recording;
    beforeEach(() => {
      recording = recorder(webUSB);
    });

    it('logs calls to requestDevice', async () => {
      const device = await recording.requestDevice(options);
      expectToHaveSteps(recording, requestDeviceSteps);
    });

    it('passes on the parameters we give to requestDevice', async () => {
      const device = await recording.requestDevice(options);
      expect(device.myOptions()).toEqual(options);
    });

    it('logs calls to getDevices', async () => {
      const devices = await recording.getDevices(options);
      expectToHaveSteps(recording, getDevicesSteps);
    });

    it('passes on the parameters we give to getDevices', async () => {
      const devices = await recording.getDevices(options);
      expect(devices[0].myOptions()).toEqual(options);
    });

  });

  describe('device object', () => {

    let recording;
    beforeEach(() => {
      recording = recorder(webUSB);
    });

    describe('obtained through requestDevice', () => {

      let device;
      beforeEach(async () => {
        device = await recording.requestDevice(options);
      });

      it('passes on and logs function calls', () => {
        expect(device.myFunc(2, 3)).toEqual([ 2, 3, 5 ]);
        expectToHaveSteps(recording, [
          ...requestDeviceSteps,
          {
            action: 'functionCall',
            name: 'myFunc',
            parameters: [ 2, 3 ],
            result: [ 2, 3, 5 ]
          }
        ]);
      });

      it('passes on and logs async function calls that resolve', async () => {
        expect(await device.myAsyncFunc(2, 3)).toEqual({
          input1: 2,
          input2: 3
        });
        expectToHaveSteps(recording, [
          ...requestDeviceSteps,
          {
            action: 'asyncFunctionCall',
            name: 'myAsyncFunc',
            parameters: [ 2, 3 ],
            resolve: {
              input1: 2,
              input2: 3
            }
          }
        ]);
      });

      it('passes on and logs async function calls that reject', async () => {
        await expect(device.myRejectFunc(2, 3)).rejects.toEqual('bad');
        expectToHaveSteps(recording, [
          ...requestDeviceSteps,
          {
            action: 'asyncFunctionCall',
            name: 'myRejectFunc',
            parameters: [ 2, 3 ],
            reject: 'bad'
          }
        ]);
      });

      it('passes on and logs property reads', () => {
        expect(device.myProp).toEqual('hello');
        expectToHaveSteps(recording, [
          ...requestDeviceSteps,
          {
            action: 'propertyAccess',
            name: 'myProp',
            result: 'hello'
          }
        ]);
      });

    });

    describe('obtained through getDevices', () => {

      let device;
      beforeEach(async () => {
        device = (await recording.getDevices(options))[0];
      });

      it('passes on and logs function calls', () => {
        expect(device.myFunc(2, 3)).toEqual([ 2, 3, 5 ]);
        expectToHaveSteps(recording, [
          ...getDevicesSteps,
          {
            action: 'functionCall',
            name: 'myFunc',
            parameters: [ 2, 3 ],
            result: [ 2, 3, 5 ]
          }
        ]);
      });

      it('passes on and logs async function calls that resolve', async () => {
        expect(await device.myAsyncFunc(2, 3)).toEqual({
          input1: 2,
          input2: 3
        });
        expectToHaveSteps(recording, [
          ...getDevicesSteps,
          {
            action: 'asyncFunctionCall',
            name: 'myAsyncFunc',
            parameters: [ 2, 3 ],
            resolve: {
              input1: 2,
              input2: 3
            }
          }
        ]);
      });

      it('passes on and logs async function calls that reject', async () => {
        await expect(device.myRejectFunc(2, 3)).rejects.toEqual('bad');
        expectToHaveSteps(recording, [
          ...getDevicesSteps,
          {
            action: 'asyncFunctionCall',
            name: 'myRejectFunc',
            parameters: [ 2, 3 ],
            reject: 'bad'
          }
        ]);
      });

      it('passes on and logs property reads', () => {
        expect(device.myProp).toEqual('hello');
        expectToHaveSteps(recording, [
          ...getDevicesSteps,
          {
            action: 'propertyAccess',
            name: 'myProp',
            result: 'hello'
          }
        ]);
      });

    });

  });

  describe('making parameters and results safe', () => {

    let recording, device;
    beforeEach(async () => {
      recording = recorder(webUSB);
      device = await recording.requestDevice(options);
    });

    it('recursively saves objects', () => {
      const myObj = {
        property: 'first value',
        obj: { more: 'properties' }
      };
      device.myFunc(myObj, 0);
      myObj.property = 'second value';
      myObj.obj.more = 'wrong things';
      expectToHaveSteps(recording, [
        ...requestDeviceSteps,
        {
          action: 'functionCall',
          name: 'myFunc',
          parameters: [{
            property: 'first value',
            obj: { more: 'properties' }
          }, 0],
          result: [{
            property: 'first value',
            obj: { more: 'properties' }
          }, 0, 5]
        }
      ]);
    });

    it('recursively saves arrays', () => {
      const myArray = [ 1, 2, 3, 4, [ 5, 6 ] ];
      device.myFunc(myArray, 0);
      myArray[2] = 8;
      myArray[4][0] = 10;
      expectToHaveSteps(recording, [
        ...requestDeviceSteps,
        {
          action: 'functionCall',
          name: 'myFunc',
          parameters: [ [ 1, 2, 3, 4, [ 5, 6 ] ], 0 ],
          result: [ [ 1, 2, 3, 4, [ 5, 6 ] ], 0, 5 ]
        }
      ]);
    });

    it('saves DataViews', () => {
      const myDataView = new DataView(new ArrayBuffer(4));
      myDataView.setUint8(0, 1);
      myDataView.setUint8(1, 2);
      myDataView.setUint8(2, 3);
      myDataView.setUint8(3, 4);
      device.myFunc(myDataView, 0);
      myDataView.setUint8(2, 8);
      expectToHaveSteps(recording, [
        ...requestDeviceSteps,
        {
          action: 'functionCall',
          name: 'myFunc',
          parameters: [{
            byteLength: 4,
            byteOffset: 0,
            buffer: [1,2,3,4]
          }, 0],
          result: [{
            byteLength: 4,
            byteOffset: 0,
            buffer: [1,2,3,4]
          }, 0, 5]
        }
      ]);
    });

  });

});

function expectToHaveSteps(recording, steps) {
  expect(recording.getSteps().length).toBe(steps.length);
  recording.getSteps().forEach((step, i) => {
    expect(step).toMatchObject(steps[i]);
  });
}
