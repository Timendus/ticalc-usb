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

module.exports = {
  // String in, string out
  toUTF16: (charset, input) =>
    convert(charset, input, (cs, c) => cs[c]),
  fromUTF16: (charset, input) =>
    convert(charset, input, (cs, c) => cs.indexOf(c)),

  // Uint8Array in, string out
  parse: (input, calcType) => {
    let charset = charEncodings[calcType];
    if (!charset) return "Decoding error: can't decode strings for this calculator type";
    let output = '';
    for ( c of input ) {
      output += String.fromCharCode(charset[c]);
    }
    return output;
  }
};

function convert(charset, input, lookup) {
  return input.split('')
              .map(c => String.fromCharCode(lookup(charset, c.charCodeAt(0))))
              .join('');
}
