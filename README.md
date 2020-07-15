[![Build Status](https://travis-ci.org/Timendus/ticalc-usb.svg?branch=master)](https://travis-ci.org/Timendus/ticalc-usb)
[![Maintainability](https://api.codeclimate.com/v1/badges/06bc064d98df904cc4b7/maintainability)](https://codeclimate.com/github/Timendus/ticalc-usb/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/06bc064d98df904cc4b7/test_coverage)](https://codeclimate.com/github/Timendus/ticalc-usb/test_coverage)

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
  if ( await calculator.isReady() ) {
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
// Load file (make sure readFile returns a Uint8Array)
const file = tifiles.parseFile(readFile(filename));

if ( !tifiles.isValid(file) )
  return console.error('The file you have selected does not seem to be a valid calculator file');

if ( !tifiles.isMatch(file, calculator) )
  return console.error(`The file you have selected does not appear to be a valid file for your ${calculator.name}`);

// Assuming we received a calculator object from the `connect` event:
await calculator.sendFile(file);
```

## Developing

The easiest way to work on this library is to work on a project that makes use
of it. I use [ticalc.link](http://ticalc.link) for this, and if you don't have a
project of your own in mind, you can use it too.

First, check out both repositories:

```bash
git clone git@github.com:Timendus/ticalc.link.git
git clone git@github.com:Timendus/ticalc-usb.git
```

Then, make sure your changes to `ticalc-usb` are watched and get transpiled when
you make a change:

```bash
cd ticalc-usb
npm install
npm start
```

In another terminal, make sure you also have the tests running, so you don't
break things by accident:

```bash
cd ticalc-usb
npm run watch-tests
```

And finally, in yet another terminal, use your local `ticalc-usb` as a
dependency for `ticalc.link` and serve the website:

```bash
cd ticalc.link
sed -i.bak 's/"ticalc-usb": ".*"/"ticalc-usb": "file:\/\/..\/ticalc-usb"/g' package.json && rm package.json.bak
npm install
npm start
```

_(Note: If you don't have sed on your machine, manually replace the version
matcher for `ticalc-usb` in `ticalc.link`'s `package.json` file with
`file://../ticalc-usb`.)_

`ticalc.link` should now be running on [localhost:8080](http://localhost:8080)
with the local version of `ticalc-usb`. Any changes to `ticalc-usb` should
trigger a reload of the website automatically.
