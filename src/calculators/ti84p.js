const Ti84P = require('../dusb/ti84series');
const name = "TI-84 Plus";

module.exports = {
  name,

  // This is a filter for navigator.usb.requestDevice
  // See http://www.linux-usb.org/usb.ids for IDs
  identifier: {
    vendorId: 0x0451,
    productId: 0xe003
  },

  connect: device =>
    new Ti84P(device).connect()
}
