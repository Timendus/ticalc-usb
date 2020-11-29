// Catch all Texas Instruments devices, even those we don't support (yet)

module.exports = {
  // This is a filter for navigator.usb.requestDevice
  // See http://www.linux-usb.org/usb.ids for IDs
  identifier: {
    vendorId: 0x0451
  }
}
