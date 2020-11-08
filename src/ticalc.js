const recorder = require('./webusb/recorder');
const availableCalculators = [
  require('./calculators/z80/ti82a'),
  require('./calculators/z80/ti84p'),
  require('./calculators/z80/ti84pcse'),
  require('./calculators/z80/ti84pse'),
  require('./calculators/z80/ti84pt'),

  require('./calculators/ez80/ti83pce'),
  // require('./calculators/ez80/ti83pceep'),  // Matcher is identical to ti83pce
  require('./calculators/ez80/ti84pce'),
  // require('./calculators/ez80/ti84pcetpe'), // Matcher is identical to ti84pce
  // require('./calculators/ez80/ti84pcet'),   // Matcher is identical to ti84pce
];

// Note: this list must be ordered from least to most supported
const supportLevels = [
  'none',
  'experimental',
  'beta',
  'partial-support',
  'supported'
];

let calculators = calculatorsForSupportLevel();
let recording;

const calcCache = {};
const eventHandlers = {
  connect: [],
  disconnect: []
};

module.exports = {

  browserSupported,

  models: () => availableCalculators.map(c => ({
    name:    c.name,
    status:  c.status,
    matcher: c.matcher
  })),

  addEventListener: (evnt, handler) => {
    if ( !Object.keys(eventHandlers).includes(evnt) )
      throw `Invalid event name: ${evnt}`;

    eventHandlers[evnt].push(handler);
  },

  init: async (options = {}) => {
    const usb = options.usb || findOrCreateWebUSBRecording();
    calculators = calculatorsForSupportLevel(options.supportLevel);

    attachEventHandlers();

    // If we load the page, and we have existing paired devices, connect them
    const devices = await navigator.usb.getDevices();
    for ( let i = 0; i < devices.length; i++ ) {
      const calc = await findOrCreateDevice(devices[i]);
      eventHandlers.connect.forEach(h => h(calc));
    }
  },

  choose: async (options = {}) => {
    const usb = options.usb || findOrCreateWebUSBRecording();

    // Ask user to pick a device
    let device;
    try {
      device = await usb.requestDevice({
        filters: sortedUniqueFilters()
      });
    } catch(e) {
      throw e;
    }

    // Wrap WebUSB device in a calculator object
    const calc = await createDevice(device);

    // Fire connect event
    eventHandlers.connect.forEach(h => h(calc));
  },

  getRecording: () => recording

};

function sortedUniqueFilters() {
  return calculators.map(c => c.identifier)
                    // Unique by both properties
                    .filter((v, i, a) => i === a.findIndex(
                      t => t.vendorId  === v.vendorId &&
                           t.productId === v.productId
                    ))
                    // Sort by both properties
                    .sort((a, b) => {
                      if ( a.vendorId > b.vendorId ) return 1;
                      if ( a.vendorId < b.vendorId ) return -1;
                      return ( a.productId < b.productId ) ? 1 : -1;
                    });
}

function calculatorsForSupportLevel(level) {
  // Set default to 'supported', so consumers don't get nasty surprises
  if ( !level ) level = 'supported';

  if ( !supportLevels.includes(level) )
    throw 'Invalid support level selected, should be one of: ' + supportLevels.join(', ');

  if ( level == 'none' )
    return availableCalculators.concat(require('./calculators/catchAll'));

  const supportedLevels = supportLevels.slice(supportLevels.indexOf(level));
  return availableCalculators.filter(c => supportedLevels.includes(c.status));
}

function browserSupported() {
  return !!navigator.usb;
}

async function createDevice(device) {
  // Which type of device are we dealing with?
  const deviceHandler = calculators
    .filter(c => c.matcher)
    .find(c =>
      Object.keys(c.matcher).every(m => c.matcher[m] == device[m])
    );

  // If we couldn't find it, our USB identifiers catch more than we can support
  if ( !deviceHandler ) throw {
    message: "Calculator model not supported",
    device
  };

  // Create calculator instance and store in cache
  const calc = await deviceHandler.connect(device);
  calcCache[device.toString()] = calc;

  return calc;
}

async function findOrCreateDevice(device) {
  return calcCache[device] || await createDevice(device);
}

function attachEventHandlers() {
  navigator.usb.addEventListener('connect', async e => {
    const calc = await findOrCreateDevice(device);
    console.debug('📱 Calculator connected');
    if ( !calc ) return;
    eventHandlers.connect.forEach(h => h(calc));
  });

  navigator.usb.addEventListener('disconnect', e => {
    const calc = calcCache[e.device];
    console.debug('📱 Calculator disconnected');
    if ( !calc ) return;
    eventHandlers.disconnect.forEach(h => h(calc));
  });
}

// We work with a recorder wrapper around navigator.usb by default, so we can
// dump the recording to the console or the user if something goes wrong. Also,
// this allows for a clean point to inject some logging.
function findOrCreateWebUSBRecording() {
  if ( !browserSupported() ) throw 'Browser not supported';
  if ( recording ) return recording;
  recording = recorder(navigator.usb, {
    injections: {
      transferIn: (args, result) =>
        console.debug("🖥←📱 Received:", prettify(new Uint8Array(result.data.buffer))),
      transferOut: (args, result) =>
        console.debug("🖥→📱 Sent:    ", prettify(args[1]))
    }
  });
  return recording;
}

function prettify(buffer) {
  const hex = [...buffer].map(b =>
    b.toString(16)
     .toUpperCase()
     .padStart(2, "0")
  );
  return [
    hex.slice(0,4).join(''),
    hex.slice(4,5).join(''),
    hex.length > 10 ? [
      hex.slice(5,9).join(''),
      hex.slice(9,11).join(''),
      hex.slice(11).join(',')
    ] : hex.slice(5).join(',')
  ].flat().join(' ');
}
