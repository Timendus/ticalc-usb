const b = require('../src/byte-mangling');

describe('byte-mangling.js', () => {

  describe('working with raw packets', () => {

    describe('constructRawPacket', () => {
      it('builds a packet with a four byte size and a one byte type', () => {
        expect(b.constructRawPacket({
          type: 0x15,
          data: [1,2,3,4,5]
        })).toEqual(
          new Uint8Array([0,0,0,5, 0x15, 1,2,3,4,5])
        );
      });
    });

    describe('destructRawPacket', () => {
      it('reads in a Uint8Array and destructs it to an object', () => {
        expect(b.destructRawPacket(
          new Uint8Array([0,0,0,5, 0x15, 1,2,3,4,5])
        )).toEqual(
          {
            type: 0x15,
            size: 5,
            data: new Uint8Array([1,2,3,4,5])
          }
        );
      });
    });

  });

  describe('working with virtual packets', () => {

    describe('constructVirtualPacket', () => {
      it('builds a packet with a four byte size and a two byte type', () => {
        expect(b.constructVirtualPacket({
          type: 0x407E,
          data: [1,2,3,4,5]
        })).toEqual(
          new Uint8Array([0,0,0,5, 0x40,0x7E, 1,2,3,4,5])
        );
      });
    });

    describe('destructVirtualPacket', () => {
      it('reads in a Uint8Array and destructs it to an object', () => {
        expect(b.destructVirtualPacket(
          new Uint8Array([0,0,0,5, 0x40,0x7E, 1,2,3,4,5])
        )).toEqual(
          {
            type: 0x407E,
            size: 5,
            data: new Uint8Array([1,2,3,4,5])
          }
        );
      });
    });

  });

  describe('working with parameters', () => {

    describe('constructParameters', () => {
      it('constructs a Uint8Array from an array of parameters', () => {
        expect(b.constructParameters([
          {
            type: 0x59FA,
            size: 3,
            value: 0x123456
          },
          {
            type: 0x0001,
            size: 1,
            value: 6
          }
        ])).toEqual(
          new Uint8Array([0,2, 0x59,0xFA, 0,3, 0x12,0x34,0x56, 0x00,0x01, 0,1, 6])
        );
      });
    });

    describe('destructParameters', () => {
      it('reads in a Uint8Array and destructs it to an array', () => {
        expect(b.destructParameters(
          new Uint8Array([
            0,3,
            0xDE,0x35, 0, 0,2, 0xAB,0xCD,
            0x02,0x00, 1, 0,5, 0,0,0x12,0x34,0x56,
            0x00,0x4A, 0, 0,5, 0x12,0x34,0x56,0x78,0x90
          ])
        )).toEqual([
          {
            type: 0xDE35,
            ok: true,
            size: 2,
            value: 0xABCD
          },
          {
            type: 0x0200,
            ok: false,
            size: 5,
            value: 0x123456
          },
          {
            type: 0x004A,
            ok: true,
            size: 5,
            value: 0x1234567890
          }
        ]);
      });
    });

  });

  describe('conversion functions', () => {

    describe('intToBytes', () => {
      it('takes an integer and returns a plain array containing the value', () => {
        expect(b.intToBytes(100, 1)).toEqual([100]);
      });
      it('overflows like an 8-bit value', () => {
        expect(b.intToBytes(260, 1)).toEqual([4]);
      });
      it('splits an integer up over a given amount of bytes', () => {
        expect(b.intToBytes(100, 1)).toEqual([100]);
        expect(b.intToBytes(100, 2)).toEqual([0, 100]);
        expect(b.intToBytes(0x1234, 2)).toEqual([0x12, 0x34]);
        expect(b.intToBytes(0x1234567890, 5)).toEqual([0x12, 0x34, 0x56, 0x78, 0x90]);
        expect(b.intToBytes(0x12345678901234, 7)).toEqual([0x12, 0x34, 0x56, 0x78, 0x90, 0x12, 0x34]);
      });
      it('warns us if we try to convert a number that\'s too large', () => {
        // Any number larger than Number.MAX_SAFE_INTEGER
        expect(() => b.intToBytes(0x1234567890123456, 8)).toThrow('Number too big to reliably convert');
      });
    });

    describe('bytesToInt', () => {
      it('takes a plain array of bytes and interprets it like an integer', () => {
        expect(b.bytesToInt([100])).toEqual(100);
      });
      it('overflows like an 8-bit value', () => {
        expect(b.bytesToInt([260])).toEqual(4);
      });
      it('understands large, multi-byte integers', () => {
        expect(b.bytesToInt([0, 100])).toEqual(100);
        expect(b.bytesToInt([0x12, 0x34])).toEqual(0x1234);
        expect(b.bytesToInt([0x12, 0x34, 0x56, 0x78, 0x90])).toEqual(0x1234567890);
        expect(b.bytesToInt([0x12, 0x34, 0x56, 0x78, 0x90, 0x12, 0x34])).toEqual(0x12345678901234);
        expect(b.bytesToInt([0x00, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x90, 0x12, 0x34])).toEqual(0x12345678901234);
      });
      it('warns us if we try to convert a number that\'s too large', () => {
        // Any array representing a number larger than Number.MAX_SAFE_INTEGER,
        // which in bytes would be [0x1F, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]
        expect(() => b.bytesToInt([0x12, 0x34, 0x56, 0x78, 0x90, 0x12, 0x34, 0x56])).toThrow('Number too big to reliably convert');
        expect(() => b.bytesToInt([0x20, 0x34, 0x56, 0x78, 0x90, 0x12, 0x34])).toThrow('Number too big to reliably convert');
      });
    });

    describe('asciiToBytes', () => {
      it('converts a string to a zero terminated Uint8Array', () => {
        expect(b.asciiToBytes(
          "Hello world"
        )).toEqual(
          new Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 0])
        );
      });
      it('converts a string to a Uint8Array of specified length', () => {
        expect(b.asciiToBytes(
          "Hello world", 14
        )).toEqual(
          new Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 0, 0, 0])
        );
        expect(b.asciiToBytes(
          "Hello world", 8
        )).toEqual(
          new Uint8Array([72, 101, 108, 108, 111, 32, 119, 111])
        );
      });
    });

    describe('bytesToAscii', () => {
      it('converts a zero terminated array to a string', () => {
        expect(b.bytesToAscii(
          new Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 0])
        )).toEqual(
          "Hello world"
        );
      });
      it('converts a non zero terminated array to a string', () => {
        expect(b.bytesToAscii(
          new Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100])
        )).toEqual(
          "Hello world"
        );
      });
      it('ignores crap after the zero terminator', () => {
        expect(b.bytesToAscii(
          new Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 0, 72, 101, 108, 111])
        )).toEqual(
          "Hello world"
        );
      });
    });

  });

});
