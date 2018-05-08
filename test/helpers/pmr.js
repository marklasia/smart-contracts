const PoaManager = artifacts.require('PoaManager.sol')
const PoaToken = artifacts.require('PoaToken.sol')
const BigNumber = require('bignumber.js')
const { setupEcosystem } = require('./poa')

const setupPoaManager = async () => {
  const poam = await PoaToken.new()
  const { reg } = await setupEcosystem()
  const pmr = await PoaManager.new(reg.address, poam.address)

  return {
    poam,
    reg,
    pmr
  }
}

const addToken = async (pmr, reg, custodian, broker) => {
  const txReceipt = await pmr.addToken(
    'test', // name
    'TST', // symbol
    'EUR', // fiat currency
    custodian,
    // 60 seconds from now as unix timestamp
    new BigNumber(Date.now()) // start time
      .div(1000)
      .add(60)
      .floor(),
    // 1 day from now
    60 * 60 * 24, // funding timeout
    // 7 days from fundingTimeout
    60 * 60 * 24 * 7, // activation timeout
    5e5, // fiat goal in cents
    {
      from: broker
    }
  )

  const tokenAddress = txReceipt.logs[0].args.token

  return {
    tokenAddress,
    txReceipt
  }
}

module.exports = {
  setupPoaManager,
  addToken
}
