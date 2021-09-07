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
    const virtualPacket = b.constructVirtualPacket(packet);
    // Cut data in chunks to be sent
    const chunks = b.chunkArray(
      virtualPacket || [],
      [
        this._bufferSize - v.rawPacketTypes.HEADER_SIZE
      ]
    );

    // Send the chunks
    for ( let i = 0; i < chunks.length; i++ ) {
      // Give the last packet a type DUSB_RPKT_VIRT_DATA_LAST
      const type = i == chunks.length - 1 ?
        v.rawPacketTypes.DUSB_RPKT_VIRT_DATA_LAST:
        v.rawPacketTypes.DUSB_RPKT_VIRT_DATA ;

      const data = chunks[i];

      await this._send(b.constructRawPacket({ type, data }));
      await this._expectAck();
    }
  }

  // Expect a virtual packet of a certain type, returns the packet if the type
  // matches. Throws an error otherwise.
  async expect(virtualType) {
    let raw;
    const raw_packets = [];

    // Receive raw packets until we get a VIRT_DATA_LAST packet
    do {
      raw = b.destructRawPacket(await this._receive());
      raw_packets.push(raw);
    } while ( raw.type == v.rawPacketTypes.DUSB_RPKT_VIRT_DATA );

    if ( raw.type != v.rawPacketTypes.DUSB_RPKT_VIRT_DATA_LAST )
      throw `Expected raw packet type VIRT_DATA_LAST, but got ${raw.type} instead`;

    const combinedData = b.mergeBuffers(raw_packets.map((x) => x.data));

    const virtual = b.destructVirtualPacket(combinedData);

    switch(virtual.type) {

      // Did we get what we expected?
      case virtualType:
        await this._sendAck();
        return virtual;

      // If not, did we get a delay request?
      case v.virtualPacketTypes.DUSB_VPKT_DELAY_ACK:
        await this._sendAck();
        const delay = b.bytesToInt(virtual.data);
        await this.wait(delay / 1000);
        return this.expect(virtualType);

      // Otherwise, we have a problem here
      default:
        throw `Expected virtual packet type ${virtualType}, but got ${virtual.type} instead`;

    }
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
