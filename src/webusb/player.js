// This class provides a mock WebUSB API, so we can replay recorded interactions
// with real devices to test the software.

module.exports = (replay, options) => new Player(replay, options);

class Player {

  constructor(replay, options = {}) {
    this._replay = replay;
    this._options = options;
    this._currentStep = {};
  }

  async requestDevice(options) {
    const device = await this._expectFunction('requestDevice')(options);

    // Does this device match with the given filters?
    if ( options.filters.some(filter =>
      Object.keys(filter).every(prop =>
        filter[prop] == device[prop])) )
      return this._USBDevice(device);

    throw {
      message: "No devices found"
    };
  }

  async getDevices() {
    throw 'Replays of getDevices not implemented';
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
    // If access of this property doesn't depend on ordering with other
    // properties or functions, at least it will depend on ordering with itself.
    const inOrderWith = options && options.inOrderWith || [name];
    const marker = 'prop(s) ' + inOrderWith.sort().join(', ');

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

    if ( step && step.action == 'propertyAccess' ) {
      step.played = true;
      if ( this._options.verbose ) console.log(step);
      return step.result;
    }
    if ( name in device ) {
      console.log(`Warning: Unlogged read of property '${name}', value:`, device[name]);
      return device[name];
    }
    throw {
      name: 'ReplayError',
      message: `The application accessed unknown property '${name}'.`
    };
  }

  _expectFunction(name, options) {
    // If calls to this function don't depend on ordering with other functions,
    // at least it will depend on ordering with itself.
    const inOrderWith = options && options.inOrderWith || [name];
    const marker = 'function(s) ' + inOrderWith.sort().join(', ');

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

    return (...params) => this._apply(step, params);
  }

  _apply(step, params) {
    this._expect(
      `the parameters to call #${step.currentCall + 1} to ${step.name} to be '${JSON.stringify(params)}', but the recording shows ${this._describeStep(step)} instead`,
      JSON.stringify(params) == JSON.stringify(step.parameters),
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

  _describeStep(step) {
    return `${
      step.action == 'propertyAccess' ?
        'access to property' :
        step.action == 'functionCall' ?
          'a call to' :
          step.action == 'asyncFunctionCall' ?
            'an asynchronous call to' :
            step.action
      } '${step.name}'`;
  }

  _expect(descr, valid, step) {
    if ( !valid ) throw {
      name: 'ReplayError',
      message: `The application expected ${descr}.`,
      step
    };
  }

}