// Javascript implementation of a subset of the DUSB / CARS protocol
// Inspired by tilibs (https://github.com/debrouxl/tilibs)

const v = require('./magic-values');
const b = require('../byte-mangling');

module.exports = class Device {

  constructor(device) {
    this._device = device;
  }

  /* Public API */

  // Connect to the USB device and ask what our maximum buffer size is
  async connect() {
    // Open device and select the primary configuration
    await this._device.open();
    await this._device.selectConfiguration(this._device.configuration.configurationValue);

    // Claim the interface and its two endpoints
    const iface = this._device.configuration.interfaces[0];
    await this._device.claimInterface(iface.interfaceNumber);
    this._inEndpoint  = iface.alternates[0].endpoints.find(e => e.direction == 'in');
    this._outEndpoint = iface.alternates[0].endpoints.find(e => e.direction == 'out');

    // Ask the device for the max buffer size
    this._bufferSize = await this._requestBufferSize();
  }

  // Send a virtual packet to the device
  async send(packet) {
    // Cut data in chunks to be sent
    const chunks = b.chunkArray(
      packet.data || [],
      [
        this._bufferSize - v.virtualPacketTypes.HEADER_SIZE, // Leave room for header on first
        this._bufferSize                                     // Cut the rest in equal pieces
      ]
    );

    // Send the chunks
    for ( let i = 0; i < chunks.length; i++ ) {
      // Give the first packet a virtual header
      const data = i == 0 ?
        b.constructVirtualPacket({ ...packet, data: chunks[i] }) :
        chunks[i];

      // Give the last packet a type DUSB_RPKT_VIRT_DATA_LAST
      const type = i == chunks.length - 1 ?
        v.rawPacketTypes.DUSB_RPKT_VIRT_DATA_LAST:
        v.rawPacketTypes.DUSB_RPKT_VIRT_DATA ;

      await this._send(b.constructRawPacket({ type, data }));
      await this._expectAck();
    }
  }

  // Expect a virtual packet of a certain type, returns the packet if the type
  // matches. Throws an error otherwise. Note that this function does not
  // support a fragmented data transfer, and as such can't be used to receive a
  // program from the calculator.
  async expect(virtualType) {
    const raw = b.destructRawPacket(await this._receive());
    if ( raw.type != v.rawPacketTypes.DUSB_RPKT_VIRT_DATA_LAST )
      throw `Expected raw packet type VIRT_DATA_LAST, but got ${raw.type} instead`;

    const virtual = b.destructVirtualPacket(raw.data);
    if ( virtual.type != virtualType )
      throw `Expected virtual packet type ${virtualType}, but got ${virtual.type} instead`;

    await this._sendAck();
    return virtual;
  }

  // Halt execution for the given amount of milliseconds
  wait(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), ms);
    });
  }

  /* Private API */

  async _requestBufferSize() {
    await this._send(b.constructRawPacket({
      type: v.rawPacketTypes.DUSB_RPKT_BUF_SIZE_REQ,
      data: [ 0, 0, 4, 0 ]
    }));

    const response = b.destructRawPacket(await this._receive());
    if ( response.type != v.rawPacketTypes.DUSB_RPKT_BUF_SIZE_ALLOC )
      throw `Expected BUF_SIZE_ALLOC, got ${response.type} instead`;
    return b.bytesToInt(response.data);
  }

  _send(buffer) {
    return this._device.transferOut(this._outEndpoint.endpointNumber, buffer);
  }

  async _receive() {
    const packet = await this._device.transferIn(this._inEndpoint.endpointNumber, this._inEndpoint.packetSize);
    if ( packet.status != 'ok' ) throw `Error in receiving data from device: ${packet.status}`;
    return new Uint8Array(packet.data.buffer);
  }

  // Send a raw ack packet
  _sendAck() {
    return this._send(b.constructRawPacket({
      type: v.rawPacketTypes.DUSB_RPKT_VIRT_DATA_ACK,
      data: [ 0xE0, 0 ]
    }));
  }

  // Expect a raw ack packet
  async _expectAck() {
    const response = b.destructRawPacket(await this._receive());

    if ( response.type != v.rawPacketTypes.DUSB_RPKT_VIRT_DATA_ACK )
      throw `Expected ACK, got ${response.type} instead`;
  }

}
