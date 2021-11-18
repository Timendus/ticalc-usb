const c = require('../../src/character-encoding/convert');
const ti8x = require('../../src/character-encoding/ti8x+');

describe('Character encoding conversion', () => {

  describe('can go from TI encoding to UTF16', () => {
    it("doesn't mess up alphabetic characters", () => {
      expect(c.toUTF16(ti8x, "Hello")).toEqual("Hello");
    });
    it("can handle some special characters", () => {
      expect(c.toUTF16(ti8x, "»")).toEqual("α");
    });
  });

  describe('can go from UTF16 to TI encoding', () => {
    it("doesn't mess up alphabetic characters", () => {
      expect(c.fromUTF16(ti8x, "Hello")).toEqual("Hello");
    });
    it("can handle some special characters", () => {
      expect(c.fromUTF16(ti8x, "α")).toEqual("»");
    });
  });

});
