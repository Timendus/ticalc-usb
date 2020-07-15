const Ti84PSE = require('../dusb/ti84series');
const name = "TI-84 Plus SE";

module.exports = {
  name,

  // This is a filter for navigator.usb.requestDevice
  // See http://www.linux-usb.org/usb.ids for IDs
  identifier: {
    vendorId: 0x0451,
    productId: 0xe008
  },

  connect: device =>
    new Ti84PSE(device, name).connect()
}
