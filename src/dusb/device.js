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
    this._inEndpoint  = iface.alternate.endpoints.find(e => e.direction == 'in');
    this._outEndpoint = iface.alternate.endpoints.find(e => e.direction == 'out');

    // Ask the device for the max buffer size
    this._bufferSize = await this._requestBufferSize();

    console.debug(`🖥↔📱 Buffer size ${this._bufferSize} bytes`);
  }

  // Send a virtual packet to the device
  async send(packet) {
    // For small data packets, it's just a one-off
    if ( !packet.data || packet.data.length <= this._bufferSize - v.virtualPacketTypes.HEADER_SIZE ) {
      await this._send(b.constructRawPacket({
        type: v.rawPacketTypes.DUSB_RPKT_VIRT_DATA_LAST,
        data: b.constructVirtualPacket(packet)
      }));
      await this._expectAck();
      return;
    }

    // For larger data packets, we need to fragment the data
    // Send packet with virtual header first
    let offset = this._bufferSize - v.virtualPacketTypes.HEADER_SIZE;
    await this._send(b.constructRawPacket({
      type: v.rawPacketTypes.DUSB_RPKT_VIRT_DATA,
      data: b.constructVirtualPacket({
        ...packet,
        data: packet.data.slice(0, offset)
      })
    }));
    await this._expectAck();

    // Next, send packets with just data
    // const numPackets = Math.ceil(packet.data.length / this._bufferSize);
    const q = (packet.data.length - offset) / this._bufferSize;
		const r = (packet.data.length - offset) % this._bufferSize;

    for ( let i = 1; i <= q; i++ ) {
      await this._send(b.constructRawPacket({
        type: (i != q || r != 0) ? v.rawPacketTypes.DUSB_RPKT_VIRT_DATA : v.rawPacketTypes.VIRT_DATA_LAST,
        data: packet.data.slice(offset, offset + this._bufferSize)
      }));
      offset += this._bufferSize;
      await this._expectAck();
    }

    // Send last chunk if needed
    if ( r != 0 ) {
      await this._send(b.constructRawPacket({
        type: v.rawPacketTypes.DUSB_RPKT_VIRT_DATA_LAST,
        data: packet.data.slice(offset, offset + packet.data.length)
      }));
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
    console.debug("🖥→📱 Sent:    ", this._prettify(buffer));
    return this._device.transferOut(this._outEndpoint.endpointNumber, buffer);
  }

  async _receive() {
    const packet = await this._device.transferIn(this._inEndpoint.endpointNumber, this._inEndpoint.packetSize);
    if ( !packet.status == 'ok' ) throw `Error in receiving data from device: ${packet.status}`;
    const buffer = new Uint8Array(packet.data.buffer);
    console.debug("🖥←📱 Received:", this._prettify(buffer));
    return buffer;
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

  _prettify(buffer) {
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

}
