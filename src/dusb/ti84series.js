const Device = require('../dusb/device');
const v = require('../dusb/magic-values');
const b = require('../byte-mangling');

module.exports = class Ti84series {

  constructor({device, properties}) {
    this._d = new Device(device);
    Object.assign(this, properties);
  }

  async connect() {
    await this._d.connect();
    return this;
  }

  // Is the file type supported by our device?
  canReceive(file) {
    return this.compatibleFiles.includes(file.calcType);
  }

  // Does the device have enough storage space?
  async getStorageDetails(file) {
    const free = await this.getFreeMem();

    const required = {
      ram:   file.entries.filter(e => !e.attributes.archived)
                         .reduce((a, e) => a + e.size, 0),
      flash: file.entries.filter(e => e.attributes.archived)
                         .reduce((a, e) => a + e.size, 0)
    };

    return {
      free, required,
      fits: free.flash >= required.flash &&
            ( free.ram === undefined || free.ram >= required.ram )
    };
  }

  // Check if the calculator is connected and listening
  async isReady() {
    try {
      await this._d.send({
        type: v.virtualPacketTypes.DUSB_VPKT_PING,
        data: v.modes.DUSB_MODE_NORMAL
      });
      await this._d.expect(v.virtualPacketTypes.DUSB_VPKT_MODE_SET);
      return true;
    } catch(e) {
      console.debug(e);
      return false;
    }
  }

  // Remotely press a key on the calculator
  // For key values, see https://github.com/debrouxl/tilibs/blob/master/libticalcs/trunk/src/keys83p.h
  async pressKey(key) {
    await this._d.send({
      type: v.virtualPacketTypes.DUSB_VPKT_EXECUTE,
      data: [0, 0, v.executeCommands.DUSB_EID_KEY, 0, key]
    });
    await this._d.expect(v.virtualPacketTypes.DUSB_VPKT_DATA_ACK);
  }

  async getParameters(attributes) {
    await this._d.send({
      type: v.virtualPacketTypes.DUSB_VPKT_PARM_REQ,
      data: [
        b.intToBytes(attributes.length, 2),
        ...attributes.map(x => b.intToBytes(x, 2))
      ].flat()
    });

    const paramsResponse = await this._d.expect(v.virtualPacketTypes.DUSB_VPKT_PARM_DATA);
    return b.destructParameters(paramsResponse.data);
  }

  // Request the amount of free RAM and Flash memory
  async getFreeMem() {
    const params = await this.getParameters([
      v.parameters.DUSB_PID_FREE_RAM,
      v.parameters.DUSB_PID_FREE_FLASH,
    ]);

    if ( !params[v.parameters.DUSB_PID_FREE_RAM] )
      throw 'Could not get amount of free RAM';
    if ( !params[v.parameters.DUSB_PID_FREE_FLASH] )
      throw 'Could not get amount of free FLASH';

    return {
      ram: b.bytesToInt(params[v.parameters.DUSB_PID_FREE_RAM]),
      flash: b.bytesToInt(params[v.parameters.DUSB_PID_FREE_FLASH]),
    };
  }

  async getDirectory() {
    await this._d.send({
      type: v.virtualPacketTypes.DUSB_VPKT_DIR_REQ,
      data: [
        0, 0, 0, 3, // attribute count
        0, 1, // size
        0, 2, // type
        0, 3, // archived
        0, 1, 0, 1, 0, 1, 1 // ???
      ]
    });
    const result = [];
    while ( true ) {
      const packet = await this._d.expectAny();
      if ( packet.type == v.virtualPacketTypes.DUSB_VPKT_EOT )
        break;
      if ( packet.type != v.virtualPacketTypes.DUSB_VPKT_VAR_HDR )
        throw `Expected virtual packet type ${v.virtualPacketTypes.DUSB_VPKT_VAR_HDR}, but got ${packet.type} instead`;
      const nameLength = b.bytesToInt(packet.data.slice(0, 2));
      const name = b.bytesToAscii(packet.data.slice(2, 2 + nameLength));
      const attributes = b.destructParameters(packet.data.slice(2 + nameLength + 1));

      const size = b.bytesToInt(attributes[v.attributes.DUSB_AID_VAR_SIZE]);
      const type = b.bytesToInt(attributes[v.attributes.DUSB_AID_VAR_TYPE].slice(2));
      const archived = attributes[v.attributes.DUSB_AID_ARCHIVED][0] == 1;

      result.push({name, size, type, archived});
    }
    return result;
  }

  // Send a TI file to the calculator
  async sendFile(file) {
    for ( let i = 0; i < file.entries.length; i++ ) {
      await this._sendEntry(file.entries[i]);
    }
  }

  async _sendEntry(entry) {
    await this._d.send({
      type: v.virtualPacketTypes.DUSB_VPKT_RTS,
      data: [
        ...b.intToBytes(entry.name.length, 2),
        ...b.asciiToBytes(entry.name, entry.name.length), 0,
        ...b.intToBytes(entry.size, 4),
        v.transferModes.SILENT,
        ...this._entryParameters(entry)
      ]
    })
    await this._d.expect(v.virtualPacketTypes.DUSB_VPKT_DATA_ACK);

    await this._d.send({
      type: v.virtualPacketTypes.DUSB_VPKT_VAR_CNTS,
      data: entry.data
    });
    await this._d.expect(v.virtualPacketTypes.DUSB_VPKT_DATA_ACK);

    await this._d.send({
      type: v.virtualPacketTypes.DUSB_VPKT_EOT
    });
  }

  _entryParameters(entry) {
    return b.constructParameters([
      {
        type: v.attributes.DUSB_AID_VAR_TYPE,
        value: b.intToBytes(0xF0070000 + entry.type, 4)
      },
      {
        type: v.attributes.DUSB_AID_ARCHIVED,
        value: b.intToBytes(entry.attributes && entry.attributes.archived ? 1 : 0, 1)
      },
      {
        type: v.attributes.DUSB_AID_VAR_VERSION,
        value: b.intToBytes(entry.attributes && entry.attributes.version || 0, 1)
      }
    ]);
  }

}
