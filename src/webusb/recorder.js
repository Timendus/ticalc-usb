// This class provides a way to wrap the WebUSB API so we can record what's
// happening between our code and the device.

module.exports = (usb, options) => new Recorder(usb, options);

class Recorder {

  constructor(usb, options = {}) {
    this._usb = usb;
    this._options = options;
    this._steps = [];
  }

  async requestDevice(options) {
    const device = await this._usb.requestDevice(options);
    const recDevice = this._proxy(device);
    this._logStep({
      action: 'functionCall',
      name: 'requestDevice',
      parameters: [ options ],
      result: recDevice
    });
    return recDevice;
  }

  async getDevices() {
    const devices = await this._usb.getDevices(options);
    const recDevices = devices.map(d => this._proxy(d));
    this._logStep({
      action: 'functionCall',
      name: 'getDevices',
      parameters: [],
      result: recDevices
    });
    return recDevices;
  }

  getSteps() {
    return this._steps;
  }

  _proxy(device) {
    return new Proxy(device, {
      get: (target, prop) => {
        if ( typeof target[prop] != 'function' ) {
          const result = Reflect.get(target, prop);
          return this._logPropertyAccess(result, prop);
        }

        return (...args) => {
          const result = target[prop](...args);
          if ( result instanceof Promise )
            return this._logPromise(result, prop, args);
          else
            return this._logFunctionCall(result, prop, args);
        }
      }
    });
  }

  _logPromise(promise, prop, args) {
    return promise
    .then(res => {
      this._logStep({
        action: 'asyncFunctionCall',
        name: prop.toString(),
        parameters: safe(args),
        resolve: safe(res)
      });
      this._inject(res, prop, args);
      return res;
    })
    .catch(err => {
      this._logStep({
        action: 'asyncFunctionCall',
        name: prop.toString(),
        parameters: safe(args),
        reject: safe(err)
      });
      this._inject(err, prop, args);
      return err;
    });
  }

  _logFunctionCall(result, prop, args) {
    this._logStep({
      action: 'functionCall',
      name: prop.toString(),
      parameters: safe(args),
      result: safe(result)
    });
    this._inject(result, prop, args);
    return result;
  }

  _logPropertyAccess(result, prop) {
    this._logStep({
      action: 'propertyAccess',
      name: prop.toString(),
      result: safe(result)
    });
    return result;
  }

  _logStep(step) {
    this._steps.push(step);
    if ( this._options.verbose ) console.debug(step);
  }

  _inject(result, prop, args) {
    this._options.injections &&
    this._options.injections[prop] &&
    this._options.injections[prop](args, result);
  }

}

function safe(variable) {
  // false, undefined, null are already safe enough
  if ( !variable ) return variable;

  // Make a deep copy of the object / array / value, so the software can't mess
  // it up anymore between here and when we save it to file.
  let safevar = JSON.parse(JSON.stringify(variable));

  // DataViews are a special snowflake, we can't just JSON.stringify those.
  if ( variable instanceof DataView )
    return {
      byteLength: variable.byteLength,
      byteOffset: variable.byteOffset,
      buffer: Array.from(new Uint8Array(variable.buffer))
    };

  // Recursively apply the same treatment, because any of the child objects
  // can potentially be a DataView object
  if ( typeof variable == 'object' )
    for ( let prop in variable ) safevar[prop] = safe(variable[prop]);

  return safevar;
}
