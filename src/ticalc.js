const calculators = [
  require('./calculators/ti84p'),
  require('./calculators/ti84pse')
];

const calcCache = {};
const eventHandlers = {
  connect: [],
  disconnect: []
};

module.exports = {

  browserSupported,

  models: () => calculators.map(c => c.name),

  addEventListener: (evnt, handler) => {
    if ( !Object.keys(eventHandlers).includes(evnt) )
      throw `Invalid event name: ${evnt}`;

    eventHandlers[evnt].push(handler);
  },

  init: async () => {
    if ( !browserSupported() ) throw 'Browser not supported';

    attachEventHandlers();

    // If we load the page, and we have existing paired devices, connect them
    const devices = await navigator.usb.getDevices();
    for ( let i = 0; i < devices.length; i++ ) {
      const calc = await findOrCreateDevice(devices[i]);
      eventHandlers.connect.forEach(h => h(calc));
    }
  },

  choose: async ({ catchAll }) => {
    if ( !browserSupported() ) throw 'Browser not supported';
    if ( catchAll ) calculators.push(require('./calculators/catchAll'));

    // Ask user to pick a device
    let device;
    try {
      device = await navigator.usb.requestDevice({
        filters: calculators.map(c => c.identifier)
      });
    } catch(e) {
      if ( e.message == "No device selected." )
        return;
      throw e;
    }

    // Wrap WebUSB device in a calculator object
    const calc = await createDevice(device);

    // Fire connect event
    eventHandlers.connect.forEach(h => h(calc));
  }

};

function browserSupported() {
  return !!navigator.usb;
}

async function createDevice(device) {
  // Which type of device are we dealing with?
  const deviceHandler = calculators.find(c =>
    Object.keys(c.matcher).every(m => c.matcher[m] == device[m])
  );

  // If we couldn't find it, our USB identifiers catch more than we can support
  if ( !deviceHandler ) throw {
    message: "Calculator model not supported",
    device
  };

  // Create calculator instance and store in cache
  const calc = await deviceHandler.connect(device);
  calcCache[device] = calc;

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
