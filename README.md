[![Build Status](https://travis-ci.org/Timendus/ticalc-usb.svg?branch=master)](https://travis-ci.org/Timendus/ticalc-usb)
[![Maintainability](https://api.codeclimate.com/v1/badges/06bc064d98df904cc4b7/maintainability)](https://codeclimate.com/github/Timendus/ticalc-usb/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/06bc064d98df904cc4b7/test_coverage)](https://codeclimate.com/github/Timendus/ticalc-usb/test_coverage)
[![Downloads in NPM](https://img.shields.io/npm/dt/ticalc-usb)](https://www.npmjs.com/package/ticalc-usb)

# ticalc-usb

`ticalc-usb` is a Javascript library to communicate with Texas Instruments
graphing calculators over WebUSB. It also has a module that can parse TI files
(`*.8?p` / `*.8?g` files). As I only own a TI-84 Plus, development is highly
skewed towards that device, but other devices should be fairly simple to add.

Check out [ticalc.link](http://ticalc.link) to see the library in action.

## Status of this library

This library is currently very experimental. I have successfully communicated
with my TI-84 Plus with it, and sent files to it. However, it comes with
absolutely no guarantees that it can handle other models or even other versions
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

The `ticalc` module exposes these regular functions:

  * `browserSupported()` - returns true if `ticalc-usb` can work in the current
    browser
  * `models()` - returns an array with the names of supported calculator models,
    so we can show that to the user.
  * `addEventListener(event, handler)` - allows you to subscribe to `connect`
    and `disconnect` events. Your event handler will be called with a calculator
    object as a parameter.

And these async functions:

  * `init()` - initialise the library. This binds event handlers to
    `navigator.usb` and connects to previously connected devices. Not calling
    this results in crappy connect/disconnect events.
  * `choose()` - triggers a WebUSB dialog in which the user can choose a
    supported calculator. A successful choice will lead to a `connect` event.

Please note that the Promises that both `init` and `choose` return can be
rejected if the user selects a device that is not supported. Unfortunately Texas
Instruments reused their USB product IDs, so we can't be more specific up front.
You'll probably want to catch this error and show the user an appropriate
message.

A somewhat complete example:

```javascript
ticalc.addEventListener('connect', async calculator => {
  if ( await calculator.isReady() ) {
    // Type "HELLO", key values for TI-83/84 Plus taken from
    // https://github.com/debrouxl/tilibs/blob/master/libticalcs/trunk/src/keys83p.h
    await calculator.pressKey(0xA1);
    await calculator.pressKey(0x9E);
    await calculator.pressKey(0xA5);
    await calculator.pressKey(0xA5);
    await calculator.pressKey(0xA8);

    // Get available memory
    console.log(await calculator.getFreeMem());
  }
});

try {
  // Initialise the library
  await ticalc.init();

  // Ask user to pick a device. Don't do this on page load, browsers don't like
  // that, plus `init` may already have fired a `connect` event. Call this
  // function when the user clicks on a button.
  await ticalc.choose();
} catch(e) {
  // Handle unsupported device selected
  console.error(e);
}
```

On calculator objects you can call four async methods, three of which are shown
in the example above:

  * `isReady()` - return true if calculator is connected and listening
  * `pressKey(key)` - remotely press a key on the calculator
  * `getFreeMem()` - get free RAM and Flash memory
  * `sendFile(file)` - Sends a given file object to the calculator (silent transfer)

And one regular method:

  * `canReceive(file)` - tells you if a file is valid for this calculator

### `tifiles`

The `tifiles` module exposes these functions:

  * `parseFile(bindata)` - expects a Uint8Array and returns a file object
  * `isValid(file)` - tells you if the file you have parsed is a valid calculator file

Combined with `ticalc`, we can use these functions to send a TI file to a
connected calculator:

```javascript
// Load file (make sure readFile returns a Uint8Array)
const file = tifiles.parseFile(readFile(filename));

if ( !tifiles.isValid(file) )
  return console.error('The file you have selected does not seem to be a valid calculator file');

if ( !calculator.canReceive(file) )
  return console.error(`The file you have selected does not appear to be a valid file for your ${calculator.name}`);

// Assuming we received a calculator object from the `connect` event:
await calculator.sendFile(file);
```

### Special features

The `init` and `choose` functions can take an options object. This exposes some
special features that most people will not need, but do come in handy sometimes.

#### Accept any Texas Instruments device

If you want your user to be able to select any possible TI device, not just the
ones that are officially supported, you can do this:

```javascript
await choose({ catchAll: true });
```

I use that in [ticalc.link](http://ticalc.link) to allow users to submit support
requests for unsupported devices.

#### Inject a different WebUSB object

TODO

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
