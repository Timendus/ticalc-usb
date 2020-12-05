const Ti84series = require('./ti84series');

module.exports = class EZ80series extends Ti84series {

  // EZ80 calculators report 0 free RAM when on the homescreen, because all of
  // RAM is then being used as a buffer. We can still send files safely, we just
  // don't really know how much RAM is free. And the transfer may fail because
  // of that. So it really just is `undefined` if we get a value of zero.
  // Discussion here: https://github.com/Timendus/ticalc.link/issues/5
  async getFreeMem() {
    const freeMem = await super.getFreeMem();
    if ( freeMem.ram == 0 ) freeMem.ram = undefined;
    return freeMem;
  }

}
