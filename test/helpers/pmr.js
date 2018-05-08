const PoaManager = artifacts.require('PoaManager.sol')
const PoaToken = artifacts.require('PoaToken.sol')
const {
  setupEcosystem,
  testSetCurrencyRate,
  defaultName,
  defaultSymbol,
  defaultFiatCurrency,
  defaultFundingTimeout,
  defaultActivationTimeout,
  defaultFundingGoal,
  defaultFiatRate,
  getDefaultStartTime
} = require('./poa')

const accounts = web3.eth.accounts
const owner = accounts[0]
const custodian = accounts[9]

const setupPoaManager = async () => {
  const poam = await PoaToken.new()
  const { reg, exr, exp } = await setupEcosystem()
  const pmr = await PoaManager.new(reg.address, poam.address)

  await testSetCurrencyRate(exr, exp, defaultFiatCurrency, defaultFiatRate, {
    from: owner,
    value: 1e18
  })

  return {
    poam,
    reg,
    pmr
  }
}

const addToken = async (pmr, config) => {
  const defaultStartTime = await getDefaultStartTime()

  const txReceipt = await pmr.addToken(
    defaultName,
    defaultSymbol,
    defaultFiatCurrency,
    custodian,
    defaultStartTime,
    defaultFundingTimeout,
    defaultActivationTimeout,
    defaultFundingGoal,
    config
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
