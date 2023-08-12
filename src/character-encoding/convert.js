// All the conversion magic for character encoding, to and from different
// formats and bytes

module.exports = {
  parseAsUTF,
  parseAsTIChars,
  UTFToBytes
};

const charEncodings = {
  'TI-73':      require('./ti73'),
  'TI-82':      require('./ti82'),
  'TI-83':      require('./ti83'),
  'TI-84 Plus': require('./ti8x+'),
  'TI-85':      require('./ti85'),
  'TI-86':      require('./ti86'),
  'TI-89':      require('./ti9x'),
  'TI-92':      require('./ti9x'),
  'TI-92 Plus': require('./ti9x'),
  'TI-V200':    require('./ti9x'),
  //'TI-CBL2':    require(???),
}

function parseAsUTF(bytes) {
  // A string can be zero-terminated. Make sure we respect that
  const index = bytes.indexOf(0);
  if ( index >= 0 ) bytes = bytes.slice(0, index);

  // Interpret the rest as UTF-8 bytes
  const TD = typeof TextDecoder !== 'undefined' ? TextDecoder : require('util').TextDecoder;
  return new TD("utf8").decode(bytes);
}

function parseAsTIChars(bytes, calcType) {
  // A string can be zero-terminated. Make sure we respect that
  const index = bytes.indexOf(0);
  if ( index >= 0 ) bytes = bytes.slice(0, index);

  // Interpret the rest as a TI encoded string
  const charset = charEncodings[calcType];
  if (!charset) return "Decoding error: can't decode strings for this calculator type";
  let output = '';
  for ( c of bytes ) {
    output += String.fromCharCode(charset[c]);
  }
  return output;
}

function UTFToBytes(string) {
  const TE = typeof TextEncoder !== 'undefined' ? TextEncoder : require('util').TextEncoder;
  const bytes = new TE("utf-8").encode(string);
  return new Uint8Array(bytes);
}
