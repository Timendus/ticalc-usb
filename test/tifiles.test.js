const tifiles = require('../src/tifiles');
const fs = require('fs');

describe('tifiles.js', () => {

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
            name: 'ROMDUMP',
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
            name: 'A',
            type: 0,
            size: 9
          },
          {
            name: 'B',
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
            name: 'ROMDUMP',
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
            name: 'A',
            type: 0,
            size: 9
          },
          {
            name: 'B',
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
