// Conversion table for going from TI characters to UTF16
// Adapted from https://github.com/debrouxl/tilibs/blob/experimental2/libticonv/trunk/src/charset.cc

module.exports = require('./normalize')([
  '\0',   'b',   'o',    'd',    'h',   0x25b6, 0x2191, 0x2193,
  0x222b, 'x',   'A',     'B',    'C',   'D',    'E',    'F',

  0x221a, 180,    178,    0x2220, 176,    0x2b3,  0x22ba, 0x2264,
  0x2260, 0x2265, 0x2212, 0xd875dda4,0x2192,'?',  0x2191, 0x2193,

  ' ',    '!',    '\"',   '#',    0x2074, '%',    '&',    '\'',
  '(',    ')',    '*',    '+',    ',',    '-',    '.',    '/',

  '0',    '1',    '2',    '3',    '4',    '5',    '6',    '7',
  '8',    '9',    ':',    ';',    '<',    '=',    '>',    '?',

  '@',    'A',    'B',    'C',    'D',    'E',    'F',    'G',
  'H',    'I',    'J',    'K',    'L',    'M',    'N',    'O',

  'P',    'Q',    'R',    'S',    'T',    'U',    'V',    'W',
  'X',    'Y',    'Z',    '[',    '\\',   ']',    '^',    '_',

  '`',    'a',    'b',    'c',    'd',    'e',    'f',    'g',
  'h',    'i',    'j',    'k',    'l',    'm',    'n',    'o',

  'p',    'q',    'r',    's',    't',    'u',    'v',    'w',
  'x',    'y',    'z',    '{',    '|',    '}',    '~',    '=',

  0x2080,	0x2081, 0x2082, 0x2083, 0x2084,	0x2085,	0x2086,	0x2087,
  0x2088,	0x2089,	192+1,  192+0,  192+2,  192+4,  224+1,  224+0,

  224+2,  224+4,  200+1,  200+0,  200+2,  200+4,  231+1,  231+0,
  231+2,  231+4,  204+1,  204+0,  204+2,  204+3,  236+1,  236+0,

  236+2,  236+3,  210+1,  210+0,  210+2,  210+4,  242+1,  242+0,
  242+2,  242+4,  217+1,  217+0,  217+2,  217+3,  249+1,  249+0,

  249+2,  249+3,  199,    231,    209,    204,    '\'',   '`',
  0x0a8,  0x0bf,  0x0a1,  0x3b1,  0x3b2,  0x3b3,  0x394,  0x3b4,

  0x3b5,  0x3b8,  0x3bb,  0x3bc,  0x3c0,  0x3c1,  0x3a3,  0x3c3,
  0x3c4,  0x3d5,  0x3a9,  'x',    'y',    '?',    0x2026, 0x25c0,

  0x25fe, '?',    0x2212, 178,    176,    179,    '\n',   0x26b6,
  '_',	'_',    '_',    '_',    '_',    '_',    '_',    '_',

  '_',	'_',    '_',    '_',    '_',    '_',    '_',    '_',
  '_',	'_',    '_',    '_',    '_',    '_',    '_',    '_',

  '_',	'_',    '_',    '_',    '_',    '_',    '_',    '_',
  '_',	'_',    '_',    '_',    '_',    '_',    '_',    '_',
]);
