const c = require('../../src/character-encoding/convert');
const ti8x = require('../../src/character-encoding/ti8x+');

describe('Character encoding conversion', () => {

  describe('UTFToBytes', () => {
    it('converts a string to a zero terminated Uint8Array', () => {
      expect(c.UTFToBytes(
        "Hello world"
      )).toEqual(
        new Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 0])
      );
    });
    it('converts a string to a Uint8Array of specified length', () => {
      expect(c.UTFToBytes(
        "Hello world", 14
      )).toEqual(
        new Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 0, 0, 0])
      );
      expect(c.UTFToBytes(
        "Hello world", 8
      )).toEqual(
        new Uint8Array([72, 101, 108, 108, 111, 32, 119, 111])
      );
    });
  });

  describe('parseAsUTF', () => {
    it('converts a zero terminated array to a string', () => {
      expect(c.parseAsUTF(
        new Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 0])
      )).toEqual(
        "Hello world"
      );
    });
    it('converts a non zero terminated array to a string', () => {
      expect(c.parseAsUTF(
        new Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100])
      )).toEqual(
        "Hello world"
      );
    });
    it('ignores crap after the zero terminator', () => {
      expect(c.parseAsUTF(
        new Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 0, 72, 101, 108, 111])
      )).toEqual(
        "Hello world"
      );
    });
    it('treats special characters as UTF', () => {
      expect(c.parseAsUTF(
        new Uint8Array([0x5b, 0x7b, 0x40, 0x24])
      )).toEqual(
        "[{@$"
      );
    });
  });

  describe('parseAsTIChars', () => {
    it('converts a zero terminated array to a string', () => {
      expect(c.parseAsTIChars(
        new Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 0]),
        'TI-84 Plus'
      )).toEqual(
        "Hello world"
      );
    });
    it('converts a non zero terminated array to a string', () => {
      expect(c.parseAsTIChars(
        new Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100]),
        'TI-84 Plus'
      )).toEqual(
        "Hello world"
      );
    });
    it('ignores crap after the zero terminator', () => {
      expect(c.parseAsTIChars(
        new Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 0, 72, 101, 108, 111]),
        'TI-84 Plus'
      )).toEqual(
        "Hello world"
      );
    });
    it('treats special characters as TI encoded', () => {
      expect(c.parseAsTIChars(
        new Uint8Array([0x5b, 0x7b, 0x40, 0x24]),
        'TI-84 Plus'
      )).toEqual(
        "θ{@⁴"
      );
    });
  });

});
