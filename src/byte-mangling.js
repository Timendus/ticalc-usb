module.exports = {
  constructRawPacket,
  destructRawPacket,

  constructVirtualPacket,
  destructVirtualPacket,

  constructParameters,
  destructParameters,

  intToBytes,
  bytesToInt,
  asciiToBytes,
  bytesToAscii,

  chunkArray,
  mergeBuffers
}

function constructRawPacket(packet) {
  return constructPacket(packet, 1);
}

function constructVirtualPacket(packet) {
  return constructPacket(packet, 2);
}

// Takes an object of the form { type, data } and constructs a sequence of
// unsigned 8-bit values from it.
function constructPacket(packet, typeSize) {
  // The first 4 bytes are the packet size
  const size = packet.data && packet.data.length || 0;
  const header = intToBytes(size, 4);

  // The next part is the packet type
  header.splice(4, 0, ...intToBytes(packet.type, typeSize));

  // The rest is the actual data
  const result = new Uint8Array(header.length + size);
  result.set(header);
  result.set(packet.data || [], header.length);
  return result;
}

// Takes a sequence of unsigned 8-bit values and constructs an object of the
// form { size, type, data } from it.
function destructRawPacket(packet) {
  return {
    size: bytesToInt(packet.slice(0,4)),
    type: packet[4],
    data: packet.slice(5)
  };
}

// Takes a sequence of unsigned 8-bit values and constructs an object of the
// form { size, type, data } from it.
function destructVirtualPacket(packet) {
  return {
    size: bytesToInt(packet.slice(0,4)),
    type: bytesToInt(packet.slice(4,6)),
    data: packet.slice(6)
  };
}

// Takes a list of parameters and constructs a sequence of unsigned 8-bit values
// from it.
function constructParameters(params) {
  /**
   * Structure:
   * index  size  description
   *  0-1    2    number of parameters N
   *  2-3    2    type of the parameter
   *  5-6    2    size of the parameter X
   *  7-X    X    parameter value
   *  X-          repeat pattern N times
   */

  return new Uint8Array([
    intToBytes(params.length, 2),
    ...params.map(param => [
      intToBytes(param.type, 2),
      intToBytes(param.value.length, 2),
      ...param.value
    ].flat())
  ].flat());
}

// Takes a sequence of unsigned 8-bit values (a parameter request response) and
// finds the parameters in it.
function destructParameters(params) {
  /**
   * Structure:
   * index  size  description
   *  0-1    2    number of parameters N
   *  2-3    2    type of the parameter
   *   4     1    parameter ok or not. 0 means ok.
   *  5-6    2    size of the parameter X
   *  7-X    X    parameter value
   *  X-          repeat pattern N times
   */
  const result = {};
  const count = bytesToInt(params.slice(0,2));
  let j = 2;
  for ( let i = 0; i < count; i++ ) {
    const type = bytesToInt(params.slice(j,j+2));
    if(params[j+2] == 0) {
      const size = bytesToInt(params.slice(j+3,j+5));
      result[type] = params.slice(j+5, j+5+size);
      j += 5 + size;
    } else {
      j += 3;
    }
  }
  return result;
}

// Takes a number and spreads it out over length bytes (MSB first)
function intToBytes(num, length) {
  if ( num > Number.MAX_SAFE_INTEGER ) throw 'Number too big to reliably convert';

  const bytes = [];
  while ( length > 0 ) {
    length--;
    bytes.push((num / Math.pow(256, length)) & 0xFF);
  }
  return bytes;
}

// Takes an array of bytes and reduces it to one number (MSB first)
function bytesToInt(bytes) {
  // Result more than Number.MAX_SAFE_INTEGER?
  if ( !_bytesSafeInteger(bytes) ) throw 'Number too big to reliably convert';

  let length = bytes.length;
  let result = 0;
  let i = 0;
  while ( length > 0 ) {
    length--;
    result += (bytes[i++] & 0xFF) * Math.pow(256, length);
  }
  return result;
}

function _bytesSafeInteger(bytes) {
  // Strip off leading zeros
  // (there must be a more elegant solution, but I can't come up with one right now 😂)
  let seenValue = false;
  bytes = bytes.filter(b => {
    if ( b == 0 && !seenValue ) return false;
    seenValue = true;
    return true;
  });

  // Is what's left less than Number.MAX_SAFE_INTEGER?
  if ( bytes.length < 7 ) return true;
  if ( bytes.length == 7 ) return bytes[0] <= 0x1F;
  return false;
}

function asciiToBytes(string, length) {
  length = length || string.length + 1;
  const TE = typeof TextEncoder !== 'undefined' ? TextEncoder : require('util').TextEncoder;
  const bytes = new TE("utf-8").encode(string);
  const result = new Uint8Array(length);
  result.set(bytes.slice(0,length));
  return result;
}

function bytesToAscii(bytes) {
  // A string can be zero-terminated. Make sure we respect that
  const index = bytes.indexOf(0);
  if ( index >= 0 ) {
    bytes = bytes.slice(0, index);
  }

  // Interpret the rest as UTF-8 bytes
  const TD = typeof TextDecoder !== 'undefined' ? TextDecoder : require('util').TextDecoder;
  return new TD("utf-8").decode(bytes);
}

// Split up an array in pieces, each of a size defined in sizes. If we run out
// of sizes, but we have data left, we continue with the last given size. If we
// run out of data, we stop.
function chunkArray(array, sizes) {
  const result = [];
  let i, j = 0;
  for ( i = 0; i < sizes.length; i++ ) {
    result.push(array.slice(j, j + sizes[i]));
    j += sizes[i];
    if ( j >= array.length ) return result;
  }
  i--;
  while ( j < array.length ) {
    result.push(array.slice(j, j + sizes[i]));
    j += sizes[i];
  }
  return result;
}

// Merge multiple byte arrays into a single byte array
function mergeBuffers(buffers) {
  let totalLength = 0;
  for(const buffer of buffers) {
    totalLength += buffer.byteLength;
  }
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for(const buffer of buffers) {
    result.set(buffer, offset);
    offset += buffer.byteLength;
  }
  return result;
}
