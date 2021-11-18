// Conversion table for going from TI characters to UTF16
// TI89, 92, 92+, V200, Titanium
// Adapted from https://github.com/debrouxl/tilibs/blob/experimental2/libticonv/trunk/src/charset.cc

module.exports = require('./normalize')([
// control chars
 0, // 0x2592 is prettier
 1, // 0x2401 is prettier
 2, // 0x2402 is prettier
 3, // 0x2403 is prettier
 4, // 0x2404 is prettier
 5, // 0x2405 is prettier
 6, // 0x2406 is prettier
 7, // 0x2407, 0xd83ddd14 are prettier
 8, // 0x232b is prettier
 9, // 0x21e5 is prettier
 10, // 0x21b4 is prettier
 0x2934,
 12, // 0x219f (upwards version of 0x21a1 form feed) is prettier
 13, // 0x21b5 is prettier
 0x2693, // For now, using anchor symbol U+2693 to represent locked, but should switch to 0xd83ddd12 (U+1F512) when Unicode 6.0+ is more widely implemented.
 0x2713,
 0x25fe,
 0x25c2,
 0x25b8,
 0x25b4,
 0x25be,
 0x2190,
 0x2192,
 0x2191,
 0x2193,
 0x25c0,
 0x25b6,
 0x2b06,
 0x222a,
 0x2229,
 0x2282,
 0x2208,
// ASCII
 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63,

 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95,

 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 0x25c6,

// Greek letters
 0x3b1, 0x3b2, 0x393, 0x3b3, 0x394, 0x3b4, 0x3b5, 0x3b6, 0x3b8, 0x3bb, 0x3be, 0x3a0, 0x3c0, 0x3c1, 0x3a3, 0x3c3,
 0x3c4,
 0x3c6,
 0x3c8,
 0x3a9,
 0x3c9,
// Math symbols
 0xd875dda4, //E (non-BMP character)
 0x212f, //e
 0xd875dc8a, //i (non-BMP character)
 0x2b3, //r
 0x22ba, //T - questionable.
 0x00780305, //x bar (requires composition)
 0x00790305, //y bar (requires composition)
 0x2264,
 0x2260,
 0x2265,
 0x2220,
// Latin1
 0x2026,
 161,
 162,
 163,
 164,
 165,
 166,
 167,
 0x221a,
 169,
 170, //^g in AMS 3.10, but there is no such character in Unicode
 171,
 172,
 0x2212,
 174,
 175,
 176,
 177,
 178,
 179,
 180, //^-1, but there is no such character in Unicode 0xB9 is superscript 1
 181,
 182,
 183,
 0x207a,
 185,
 186,
 187,
 0x2202,
 0x222b,
 0x221e,
 191,

 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207,
 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223,

 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239,
 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255
]);
