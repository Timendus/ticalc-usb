// Conversion table for going from TI characters to UTF16
// Adapted from https://github.com/debrouxl/tilibs/blob/experimental2/libticonv/trunk/src/charset.cc

module.exports = require('./normalize')([
  ' ',    0x2588, '_',    0x2191, 'A',    0x25b6, '%',    '(', // 0x00-0x7F
	')',    '\"',   ',',    '!',    176,    '\'',   0x2b3,  180,

	178,    'a',    'b',    'c',    'd',    'e',    'n',    'r',
	0x2423, 'x',    'y',    0x2081, 0x2080, 0x3c0,  0xffff, '=',

	'X',    'Y',    'T',    'R',    0x3b8,  0x2025, 0x25a1, 0x207a,
	0x2d9,  '{',    '}',    179,    '.',    0x1d07, 0x2044, ':',

	'0',    '1',    '2',    '3',    '4',    '5',    '6',    '7',
	'8',    '9',    '=',    0x2260, '>',    0x2265, '<',    0x2264,

	'?',    'A',    'B',    'C',    'D',    'E',    'F',    'G',
	'H',    'I',    'J',    'K',    'L',    'M',    'N',    'O',

	'P',    'Q',    'R',    'S',    'T',    'U',    'V',    'W',
	'X',    'Y',    'Z',    0x3b8,  '+',    '-',    0x00d7, '/',

	'^',    0x207b, 0x221a, 0x3a3,  0x3c3,  0x1e8b, 0x1e8f, 0x394,
	0x1d1b, 0x2191, 0x2193, 0x2e3,  247,    '_',    '_',    '_',

	'_',    '_',    '_',    '_',    '_',    0x2592, 0x2af0, 179,
	'_',    '_',    '_',    '_',    '_',    '_',    '_',    '_',

	' ',    0x2588, '_',    0x2191, 'A',    0x25b6, '%',    '(', // 0x80-0xFF onwards: same as 0x00-0x7F
	')',    '\"',   ',',    '!',    176,    '\'',   0x2b3,  180,

	178,    'a',    'b',    'c',    'd',    'e',    'n',    'r',
	0x2423, 'x',    'y',    0x2081, 0x2080, 0x3c0,  0xffff, '=',

	'X',    'Y',    'T',    'R',    0x3b8,  0x2025, 0x25a1, 0x207a,
	0x2d9,  '{',    '}',    179,    '.',    0x1d07, 0x2044, ':',

	'0',    '1',    '2',    '3',    '4',    '5',    '6',    '7',
	'8',    '9',    '=',    0x2260, '>',    0x2265, '<',    0x2264,

	'?',    'A',    'B',    'C',    'D',    'E',    'F',    'G',
	'H',    'I',    'J',    'K',    'L',    'M',    'N',    'O',

	'P',    'Q',    'R',    'S',    'T',    'U',    'V',    'W',
	'X',    'Y',    'Z',    0x3b8,  '+',    '-',    0x00d7, '/',

	'^',    0x207b, 0x221a, 0x3a3,  0x3c3,  0x1e8b, 0x1e8f, 0x394,
	0x1d1b, 0x2191, 0x2193, 0x2e3,  247,    '_',    '_',    '_',

	'_',    '_',    '_',    '_',    '_',    0x2592, 0x2af0, 179,
	'_',    '_',    '_',    '_',    '_',    '_',    '_',    '_',
]);