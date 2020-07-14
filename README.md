[![Build Status](https://travis-ci.org/Timendus/ticalc-usb.svg?branch=master)](https://travis-ci.org/Timendus/ticalc-usb)

# ticalc-usb

`ticalc-usb` is a Javascript library to communicate with Texas Instruments
graphing calculators over WebUSB. It also has a module that can parse TI files
(`*.8?p` / `*.8?g` files). As I only own a TI-84 Plus, development is highly
skewed towards that device, but other devices should be fairly simple to add.

Check out [ticalc.link](http://ticalc.link) to see the library in action.

## Status of this library

This library is currently very experimental. I have successfully communicated
with my TI-84 Plus with it, and sent files to it. However, it comes with
absolutely no guarantees that it can handle other models or even other version
of the TI-84 Plus, nor that it can properly parse and send any file you throw at
it. So be warned.

If you run into issues, please
[report them](https://github.com/Timendus/ticalc-usb/issues/new) or submit a PR.

## Usage

`ticalc-usb` is [available through NPM](https://www.npmjs.com/package/ticalc-usb)
and can be installed as a dependency using NPM or Yarn:

```bash
npm install --save ticalc-usb
```

You can then import both modules of the library in your project like this:

```javascript
const { ticalc, tifiles } = require('ticalc-usb');
```

### `ticalc`

The `ticalc` module exposes three functions:

  * `models()` - returns an array with the names of supported calculator models, so we can show that to the user.
  * `addEventListener(event, handler)` - allows you to subscribe to `connect` and `disconnect` events. Your event handler will be called with a calculator object as a parameter.
  * `choose()` - triggers a WebUSB dialog in which the user can choose a supported calculator. A successful choice will lead to a `connect` event.

```javascript
ticalc.addEventListener('connect', async calculator => {
  if ( calculator.isReady() ) {
    // Type "HELLO":
    await calculator.pressKey(0xA1);
    await calculator.pressKey(0x9E);
    await calculator.pressKey(0xA5);
    await calculator.pressKey(0xA5);
    await calculator.pressKey(0xA8);

    // Get available memory
    console.log(await calculator.getFreeMem());
  }
});

// Ask user to pick a device
ticalc.choose();
```

On calculator objects you can call these async methods:

  * `isReady()` - return true if calculator is connected and listening
  * `pressKey(key)` - remotely press a key on the calculator
  * `getFreeMem()` - get free RAM and Flash memory
  * `sendFile(file)` - Sends a given file object to the calculator (silent transfer)

### `tifiles`

The `tifiles` module exposes these functions:

  * `parseFile(bindata)` - expects a Uint8Array and returns a file object
  * `isValid(file)` - tells you if the file you have parsed is a valid calculator file
  * `isMatch(file, calculator)` - tells you if the file is valid for this calculator

Combined with `ticalc`, we can use these functions to send a TI file to a
connected calculator:

```javascript
// Load file
// (Make sure readFile returns a Uint8Array)
const file = tifiles.parseFile(readFile(filename));

if ( !tifiles.isValid(file) )
  return console.error('The file you have selected does not seem to be a valid calculator file');

if ( !tifiles.isMatch(file, calculator) )
  return console.error(`The file you have selected does not appear to be a valid file for your ${calculator.name}`);

await calculator.sendFile(file);
```
