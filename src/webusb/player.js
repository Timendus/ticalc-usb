// This class provides a mock WebUSB API, so we can replay recorded interactions
// with real devices to test the software.

module.exports = (replay, options) => new Player(replay, options);

const objectsEqual = (o1, o2) =>
    typeof o1 === 'object' && Object.keys(o1).length > 0
    ? Object.keys(o1).length === Object.keys(o2).length
        && Object.keys(o1).every(p => objectsEqual(o1[p], o2[p]))
    : o1 === o2;

const arraysEqual = (a1, a2) =>
    a1.length === a2.length && a1.every((o, idx) => objectsEqual(o, a2[idx]));

class Player {

  constructor(replay, options = {}) {
    this._replay = replay;
    this._options = options;
    this._currentStep = {};
  }

  async requestDevice(options) {
    try {
      const device = await this._expectFunction('requestDevice')(options);
      return this._USBDevice(device);
    } catch(e) {
      // If we don't have a step for 'requestDevice' with these options, then
      // we pretend that the device is not connected.
      if ( e.name == 'ReplayError' )
        throw {
          message: "No devices found"
        };
      throw e;
    }
  }

  async getDevices() {
    throw 'Replays of getDevices not yet implemented';
  }

  unplayedSteps() {
    return this._replay.filter(step => !step.played);
  }

  _USBDevice(device) {
    return new Proxy({}, {
      get: (_, prop) => {
        switch(prop) {

          // A function was accessed on the device

          case 'transferIn':
          case 'transferOut':
            return this._expectFunction(prop, { inOrderWith: ['transferIn', 'transferOut'] });

          case 'claimInterface':
          case 'selectConfiguration':
          case 'open':
          case 'toString':
            return this._expectFunction(prop);

          // A property was accessed on the object

          default:
            return this._expectProperty(prop, device);

        }
      }
    });
  }

  _expectProperty(name, device, options) {
    try {
      return this._accessLoggedProperty(name, device, options);
    } catch(e) {
      if ( e.name == 'ReplayError' && name in device ) {
        console.log(`Warning: Unlogged read of property '${name}', value:`, device[name]);
        return device[name];
      }
      throw e;
    }
  }

  _accessLoggedProperty(name, device, options) {
    const step = this._getStep(name, options, 'prop(s)');

    if ( step.action == 'propertyAccess' ) {
      step.played = true;
      if ( this._options.verbose ) console.log(step);
      return step.result;
    }

    throw {
      name: 'ReplayError',
      message: `The application accessed unknown property '${name}'.`
    };
  }

  _expectFunction(name, options) {
    const step = this._getStep(name, options, 'function(s)');
    return (...params) => this._apply(step, params);
  }

  _apply(step, params) {
    this._expect(
      `the parameters to call #${step.currentCall + 1} to ${step.name} to be '${JSON.stringify(params)}', but the recording shows ${this._describeStep(step)} instead`,
        (params instanceof Array ? arraysEqual(params, step.parameters)
         : typeof params === 'object' ? objectsEqual(params, step.parameters)
         : JSON.stringify(params) === JSON.stringify(step.parameters)),
      step
    );

    step.played = true;

    if ( this._options.verbose )
      console.log(step);

    if ( step.action == 'functionCall' )
      return step.result;

    // Async function otherwise
    if ( 'resolve' in step ) // note that value can be undefined (falsy)
      return Promise.resolve(step.resolve);
    if ( 'reject' in step )
      return Promise.reject(step.reject);
  }

  _getStep(name, options, markerPrefix) {
    // If access of this property doesn't depend on ordering with other
    // properties, at least it will depend on ordering with itself.
    const inOrderWith = options && options.inOrderWith || [name];
    const marker = `${markerPrefix} ${inOrderWith.sort().join(', ')}`;

    if ( !(marker in this._currentStep) )
      this._currentStep[marker] = 0;
    else
      this._currentStep[marker]++;

    const steps = this._replay.filter(step => inOrderWith.includes(step.name));
    this._expect(
      `there to be at least ${this._currentStep[marker] + 1} steps for '${marker}'`,
      this._currentStep[marker] < steps.length,
      steps
    );

    const step = steps[this._currentStep[marker]];
    step.currentCall = this._currentStep[marker];
    return step;
  }

  _describeStep(step) {
    switch(step.action) {
      case 'propertyAccess':
        return `access to property ${step.name}`;
      case 'functionCall':
        return `a call to ${step.name} with parameters ${JSON.stringify(step.parameters)}`;
      case 'asyncFunctionCall':
        return `an asynchronous call to ${step.name} with parameters ${JSON.stringify(step.parameters)}`;
    }
  }

  _expect(descr, valid, step) {
    if ( !valid ) throw {
      name: 'ReplayError',
      message: `The application expected ${descr}.`,
      step
    };
  }

}
