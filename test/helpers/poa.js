const PoaManagerStub = artifacts.require('PoaManagerStub')
const BrickblockWhitelist = artifacts.require('BrickblockWhitelist')
const BrickblockFeeManager = artifacts.require('BrickblockFeeManager')

const { setupRegistry } = require('./general')

const setupPoaRegistry = async () => {
  const reg = await setupRegistry()
  const pmr = await PoaManagerStub.new()
  const wht = await BrickblockWhitelist.new()
  const fmr = await BrickblockFeeManager.new()
  await reg.updateContract('PoaManager', pmr.address)
  await reg.updateContract('Whitelist', wht.address)
  await reg.updateContract('FeeManager', fmr.address)
  return {
    pmr: pmr.address,
    wht: wht.address,
    fmr: fmr.address
  }
}

module.exports = {
  setupPoaRegistry
}
