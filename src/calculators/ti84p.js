const Ti84P = require('../dusb/ti84series');

module.exports = {
  name: "TI-84 Plus",

  // This is a filter for navigator.usb.requestDevice
  // See http://www.linux-usb.org/usb.ids for IDs
  identifier: {
    vendorId: 0x0451,
    productId: 0xe003
  },

  // This is the matcher used to find this specific device
  matcher: {
    vendorId: 0x0451,
    productId: 0xe003
  },

  connect: device => new Ti84P({
    device,

    // These are the file types we can send this particular device
    compatibleFiles: [
      'TI-83',
      'TI-84 Plus'
    ]
  }).connect()
}
