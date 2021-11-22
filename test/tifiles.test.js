const tifiles = require('../src/tifiles');
const fs = require('fs');

describe('tifiles.js', () => {

  describe('isValid', () => {
    it('returns true for a file with a calc type, sane size and some entries', () => {
      expect(tifiles.isValid({
        calcType: 'TI-84 Plus',
        size: 315,
        debug: {
          sizeCorrect: true
        },
        entries: [ {} ]
      })).toBe(true);
    });
    it('returns false for a file without a calcType', () => {
      expect(tifiles.isValid({
        calcType: 'NONE',
        size: 315,
        debug: {
          sizeCorrect: true
        },
        entries: [ {} ]
      })).toBe(false);
    });
    it('returns false for a file without a size of zero', () => {
      expect(tifiles.isValid({
        calcType: 'TI-84 Plus',
        size: 0,
        debug: {
          sizeCorrect: true
        },
        entries: [ {} ]
      })).toBe(false);
    });
    it('returns false for a file with a wrong size (no checksum present, for example)', () => {
      expect(tifiles.isValid({
        calcType: 'TI-84 Plus',
        size: 315,
        debug: {
          sizeCorrect: false
        },
        entries: [ {} ]
      })).toBe(false);
    });
    it('returns false for a file with no entries', () => {
      expect(tifiles.isValid({
        calcType: 'TI-84 Plus',
        size: 315,
        debug: {
          sizeCorrect: true
        },
        entries: []
      })).toBe(false);
    });
  });

  describe('parsing invalid files', () => {
    it('at least results in an invalid calc type and an incorrect size', () => {
      const file = read('./test/binaries/ti73/readme.txt');
      expect(file).toMatchObject({
        calcType: 'NONE',
        debug: {
          sizeCorrect: false
        }
      });
    });
  });

  describe('parsing TI-73 files', () => {

    it('can parse a program file', () => {
      const file = read('./test/binaries/ti73/romdump.73p');
      expectEntriesToAddUpToFileSize(file);
      expect(file.entries.length).toBe(1);
      expect(file).toMatchObject({
        calcType: 'TI-73',
        comments: 'Created by ticonv 0.1, 07/28/2005',
        size: 731,
        entries: [
          {
            displayName: 'ROMDUMP',
            type: 6,
            size: 716
          }
        ],
        debug: {
          sizeCorrect: true
        }
      });
    });

    it('can parse a group file', () => {
      const file = read('./test/binaries/ti73/Boggle.73g');
      expectEntriesToAddUpToFileSize(file);
      expect(file.entries.length).toBe(3);
      expect(file).toMatchObject({
        calcType: 'TI-73',
        comments: '05/29/02, 12:47',
        size: 1451,
        entries: [
          {
            displayName: 'BOGGLE',
            type: 5,
            size: 1159
          },
          {
            displayName: ']BOGGL',
            type: 1,
            size: 11
          },
          {
            displayName: ']ASCII',
            type: 13,
            size: 236
          }
        ],
        debug: {
          sizeCorrect: true
        }
      });
    });

  });

  describe('parsing TI-82 files', () => {

    it('can parse a program file', () => {
      const file = read('./test/binaries/ti82/math.82p');
      expectEntriesToAddUpToFileSize(file);
      expect(file.entries.length).toBe(1);
      expect(file).toMatchObject({
        calcType: 'TI-82',
        comments: 'File received by TiLP',
        size: 116,
        entries: [
          {
            displayName: 'TVA',  // Not sure if this is right
            type: 5,      // But it could be ;)
            size: 101
          }
        ],
        debug: {
          sizeCorrect: true
        }
      });
    });

    it('can parse a group file', () => {
      const file = read('./test/binaries/ti82/group.82g');
      expectEntriesToAddUpToFileSize(file);
      expect(file.entries.length).toBe(2);
      expect(file).toMatchObject({
        calcType: 'TI-82',
        comments: 'File received by TiLP',
        size: 48,
        entries: [
          {
            displayName: 'A',
            type: 0,
            size: 9
          },
          {
            displayName: 'B',
            type: 0,
            size: 9
          }
        ],
        debug: {
          sizeCorrect: true
        }
      });
    });

  });

  describe('parsing TI-83 files', () => {

    it('can parse a program file', () => {
      const file = read('./test/binaries/ti83/romdump.83p');
      expectEntriesToAddUpToFileSize(file);
      expect(file.entries.length).toBe(1);
      expect(file).toMatchObject({
        calcType: 'TI-83',
        comments: 'Created by ticonv 0.1, 07/28/2005',
        size: 721,
        entries: [
          {
            displayName: 'ROMDUMP',
            type: 6,
            size: 706
          }
        ],
        debug: {
          sizeCorrect: true
        }
      });
    });

    it('can parse a group file', () => {
      const file = read('./test/binaries/ti83/group.83g');
      expectEntriesToAddUpToFileSize(file);
      expect(file.entries.length).toBe(2);
      expect(file).toMatchObject({
        calcType: 'TI-83',
        comments: 'Grouped file dated 07/03/05, 14:54',
        size: 48,
        entries: [
          {
            displayName: 'A',
            type: 0,
            size: 9
          },
          {
            displayName: 'B',
            type: 0,
            size: 9
          }
        ],
        debug: {
          sizeCorrect: true
        }
      });
    });

  });

  describe('parsing TI-84 Plus files', () => {

    it('can parse a program file', () => {
      const file = read('./test/binaries/ti84p/romdump.8Xp');
      expectEntriesToAddUpToFileSize(file);
      expect(file.entries.length).toBe(1);
      expect(file).toMatchObject({
        calcType: 'TI-84 Plus',
        comments: 'ProtProgram file 04/06/05, 16:33',
        size: 438,
        entries: [
          {
            displayName: 'ROMDUMP',
            type: 6,
            size: 421
          }
        ],
        debug: {
          sizeCorrect: true
        }
      });
    });

    it('can parse a group file', () => {
      const file = read('./test/binaries/ti84p/group.8Xg');
      expectEntriesToAddUpToFileSize(file);
      expect(file.entries.length).toBe(2);
      expect(file).toMatchObject({
        calcType: 'TI-84 Plus',
        comments: 'Real file 04/06/05, 16:32',
        size: 52,
        entries: [
          {
            displayName: 'A',
            type: 0,
            size: 9
          },
          {
            displayName: 'B',
            type: 0,
            size: 9
          }
        ],
        debug: {
          sizeCorrect: true
        }
      });
    });

  });

  describe('parsing TI-85 files', () => {

    it('can parse a program file', () => {
      const file = read('./test/binaries/ti85/MATH.85P');
      expectEntriesToAddUpToFileSize(file);
      expect(file.entries.length).toBe(1);
      expect(file).toMatchObject({
        calcType: 'TI-85',
        comments: 'Program file dated 12/27/97, 08:31',
        size: 410,
        entries: [
          {
            displayName: 'FList',
            type: 18,
            size: 397
          }
        ],
        debug: {
          sizeCorrect: true
        }
      });
    });

    it('can parse a group file', () => {
      const file = read('./test/binaries/ti85/GROUP.85G');
      expectEntriesToAddUpToFileSize(file);
      expect(file.entries.length).toBe(2);
      expect(file).toMatchObject({
        calcType: 'TI-85',
        comments: 'Group file dated 07/21/05, 15:45',
        size: 38,
        entries: [
          {
            displayName: 'A',
            type: 0,
            size: 10
          },
          {
            displayName: 'B',
            type: 0,
            size: 10
          }
        ],
        debug: {
          sizeCorrect: true
        }
      });
    });

  });

  describe('parsing TI-86 files', () => {

    it('can parse a program file', () => {
      const file = read('./test/binaries/ti86/prgm.86p');
      expectEntriesToAddUpToFileSize(file);
      expect(file.entries.length).toBe(1);
      expect(file).toMatchObject({
        calcType: 'TI-86',
        comments: 'Created by ticonv 0.1, 07/28/2005',
        size: 707,
        entries: [
          {
            displayName: 'ROMDump',
            type: 18,
            size: 692
          }
        ],
        debug: {
          sizeCorrect: true
        }
      });
    });

    it('can parse a group file', () => {
      const file = read('./test/binaries/ti86/group.86g');
      expectEntriesToAddUpToFileSize(file);
      expect(file.entries.length).toBe(2);
      expect(file).toMatchObject({
        calcType: 'TI-86',
        comments: 'File received by tilp',
        size: 52,
        entries: [
          {
            displayName: 'Y',
            type: 0,
            size: 10
          },
          {
            displayName: 'X',
            type: 0,
            size: 10
          }
        ],
        debug: {
          sizeCorrect: true
        }
      });
    });

  });

});

function read(file) {
  return tifiles.parseFile(
    new Uint8Array(fs.readFileSync(file))
  );
}

function expectEntriesToAddUpToFileSize(file) {
  expect(file.entries.reduce(
    (a,e) => a + e.entrySize,
    0
  )).toEqual(file.size);
}
