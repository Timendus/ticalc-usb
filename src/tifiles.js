// Javascript implementation of a subset of the tifiles library
// Inspired by tilibs (https://github.com/debrouxl/tilibs)

const b = require('./byte-mangling');

module.exports = {

  parseFile: file => {
    /**
     * Structure:
     * index  size  description
     *  0-7    8    calculator type header (called signature in tilibs code)
     *  8-10   3    skipped by tilibs, looks like it's pretty much always the same (called signature in my code)
     * 11-52   42   file comments
     * 53-54   2    file size X (little-endian)
     * 55-Y    X    entries
     *  Y-Z    2    checksum
     */

    // We need these for the entries function
    const calcType = getCalcType(file.slice(0,8));
    const size = b.bytesToInt(file.slice(53, 55).reverse());

    return {
      calcType, size,
      comments:  b.bytesToAscii(file.slice(11, 53)),
      entries:   findEntries(file.slice(55), { size, calcType }),
      debug: {
        signature: getSignature(file.slice(8,11)),
        sizeCorrect: file.length == size + 8 + 3 + 42 + 2 + 2,
        checksum: file.slice(file.length - 2, file.length)
      }
    }
  },

  isValid: file =>
    file.calcType != 'NONE' &&
    file.size > 0 &&
    file.debug.sizeCorrect &&
    file.entries.length > 0,

  isMatch: (file, calculator) => file.calcType == calculator.name

}

function getCalcType(bytes) {
  switch(b.bytesToAscii(bytes)) {
    case '**TI73**':
      return 'TI-73';
    case '**TI82**':
      return 'TI-82';
    case '**TI83**':
      return 'TI-83';
    case '**TI83F*':
      return 'TI-84 Plus';
    case '**TI85**':
      return 'TI-85';
    case '**TI86**':
      return 'TI-86';
    case '**TI89**':
      return 'TI-89';
    case '**TI92**':
      return 'TI-92';
    case '**TI92P*':
      return 'TI-92 Plus';
    case '**V200**':
      return 'TI-V200';
    case '**TICBL*':
      return 'TI-CBL2';
    default:
      // Selected file is not suitable for any known calculator
      return 'NONE';
  }
}

function findEntries(bytes, file) {
  const entries = [];
  let offset = 0;
  while ( offset < file.size ) {
    const entry = getEntry(bytes.slice(offset), file);
    entries.push(entry);
    offset += entry.entrySize;
  }
  return entries;
}

function getEntry(bytes, file) {
  /**
   * This is probably the least obvious part of the file reading code of tilibs.
   * The file is read twice and parsed in two different ways.
   *
   * Structure:
   * index  size  description
   *  0-1    2    packetLength / attributes magic numbers (little endian)
   *  2-3    2    entry size N in bytes (little endian)
   *   4     1    variable type
   *   4     1    name length X (TI-85/86)
   *  5-A   X/8   entry name (length is X or 8 depending on model)
   *  A-B    2    attributes (TI-84 Plus only)
   *  B-C    2    size again..? in bytes (little endian)
   *  C-Z    N    entry data
   */

  const header = entryHeader(bytes, file);
  const size = b.bytesToInt(bytes.slice(2, 4).reverse());

  return {
    name: b.bytesToAscii(header.name),
    type: bytes[4],
    attributes: header.attributes,
    size,
    data: bytes.slice(header.size, header.size + size),
    entrySize: header.size + size,
    debug: {
      packetLength: b.bytesToInt(bytes.slice(0, 2).reverse()),
      ti83p: b.bytesToInt(bytes.slice(0, 2).reverse()) == 0xD,
      padded86: b.bytesToInt(bytes.slice(0, 2).reverse()) > 0xC,
      nameLength: bytes[4],
      headerSize: header.size,
      size2: b.bytesToInt(bytes.slice(header.size - 2, header.size).reverse())
    }
  };
}

function entryHeader(bytes, file) {
  const packetLength = b.bytesToInt(bytes.slice(0, 2).reverse());
  const ti83p = packetLength == 0xD;
  const padded86 = packetLength > 0xC;

  // Logic taken from files8x.cc line 212 and further
  if ( file.calcType == 'TI-85' ) {
    // packetLength + size + type + nameLength + name
    return {
      size: 2 + 2 + 1 + 1 + bytes[5],
      name: bytes.slice(5, 5 + bytes[5]),
      attributes: false
    };
  } else if ( file.calcType == 'TI-86' ) {
    // packetLength + size + type + nameLength + name, padded or real length
    return {
      size: 2 + 2 + 1 + padded86 ? 8 : bytes[5],
      name: bytes.slice(5, padded86 ? 5 + 8 : 5 + bytes[5]),
      attributes: false
    };
  } else if ( ti83p ) {
    const attributes = b.bytesToInt(bytes.slice(12, 14).reverse());
    return {
      // packetLength + size + type + padded name + attributes + size2?
      size: 2 + 2 + 1 + 8 + 2 + 2,
      name: bytes.slice(5, 5 + 8),

      // Not sure what this magic is good for, but just to be complete:
      attributes: attributes == 0x80 ? {
        archived: true,
        version: 0
      } : {
        archived: !!(attributes & 0x8000),
        version: attributes & 0xFF
      }
    };
  } else {
    // packetLength + size + type + padded name + size2?
    return {
      size: 2 + 2 + 1 + 8 + 2,
      name: bytes.slice(5, 5 + 8),
      attributes: false
    };
  }
}

function getSignature(bytes) {
  if ( bytes[0] == 0x1A &&
       bytes[1] == 0x0C &&
       bytes[2] == 0x00 )
    return 'TI-85 style signature present';

  if ( bytes[0] == 0x1A &&
       bytes[1] == 0x0A &&
       bytes[2] == 0x00 )
    return 'TI-73/82/83/86 style signature present';

  return 'NONE';
}