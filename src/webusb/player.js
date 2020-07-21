// This class provides a mock WebUSB API, so we can replay recorded interactions
// with real devices to test the software.

module.exports = (replay, options) => new Player(replay, options);

class Player {

  constructor(replay, options = {}) {
    this._replay = replay;
    this._options = options;
    this._currentStep = 0;
  }

  async requestDevice(options) {
    const device = await this._expectFunction('requestDevice');

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
    // TODO
  }

  _USBDevice(device) {
    return new Proxy({}, {
      get: (_, prop) => {
        if ( this._nextStepIsProperty() )
          return this._expectProperty(prop);

        return (...args) => this._expectFunction(prop, args);
      }
    });
  }

  _expectFunction(name, params) {
    const step = this._nextStep();
    this._expect(
      `the next step to be a call to '${name}', but the recording shows ${this._describeStep(step)} instead`,
      step.action == 'functionCall' || step.action == 'asyncFunctionCall' &&
      step.name == name,
      step
    );
    if ( params )
      this._expect(
        `the parameters of the call to '${name}' to be ${JSON.stringify(params)}, but the recording shows ${this._describeStep(step)} instead`,
        JSON.stringify(params) == JSON.stringify(step.parameters),
        step
      );

    if ( step.action == 'functionCall' )
      return step.result;

    // Async function otherwise
    if ( 'resolve' in step ) // note that value can be undefined (falsy)
      return new Promise.resolve(step.resolve);
    if ( 'reject' in step )
      return new Promise.reject(step.reject);
  }

  _expectProperty(name) {
    const step = this._nextStep();
    this._expect(
      `the next step to be access to property '${name}', but the recording shows ${this._describeStep(step)} instead`,
      step.action == 'propertyAccess' &&
      step.name == name,
      step
    );
    return step.result;
  }

  _nextStepIsProperty() {
    return this._replay[this._currentStep].action == 'propertyAccess';
  }

  _nextStep() {
    const step = this._replay[this._currentStep++];
    if ( this._options.verbose ) console.debug(step);
    return step;
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

  _inject(result, prop, args) {
    this._options.injections &&
    this._options.injections[prop] &&
    this._options.injections[prop](args, result);
  }

}
