const properties = {
  name: "TI-84 Plus",
  status: "supported",

  // This is a filter for navigator.usb.requestDevice
  // See http://www.linux-usb.org/usb.ids for IDs
  identifier: {
    vendorId: 0x0451,
    productId: 0xe003
  },

  // This is the matcher used to identify this specific device
  matcher: {
    vendorId: 0x0451,
    productId: 0xe003
  },

  // This is the character encoding scheme that the device expects
  characterEncoding: 'TI-84 Plus',

  // These are the file types we can send this particular device
  compatibleFiles: [
    'TI-83',
    'TI-84 Plus'
  ]
};

const Calculator = require('../../dusb/ti84series');
module.exports = {
  ...properties,
  connect: device => new Calculator({ device, properties }).connect()
};
