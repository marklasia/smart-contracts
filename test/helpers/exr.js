const assert = require('assert')
const BigNumber = require('bignumber.js')
const ExchangeRates = artifacts.require('ExchangeRates')
const ExchangeRatesProvider = artifacts.require(
  './stubs/ExchangeRatesProviderStub'
)
const Registry = artifacts.require('BrickblockContractRegistry')

const setupContracts = async () => {
  const reg = await Registry.new()
  const exr = await ExchangeRates.new(reg.address)
  const exp = await ExchangeRatesProvider.new(reg.address)
  await reg.updateContractAddress('ExchangeRates', exr.address)
  await reg.updateContractAddress('ExchangeRatesProvider', exp.address)

  return {
    reg,
    exr,
    exp
  }
}

const testUninitializedSettings = async exr => {
  const [
    preCallInterval,
    preCallbackGasLimit,
    preQueryString
  ] = await exr.getCurrencySettingsReadable('USD')

  assert.equal(
    preCallInterval.toString(),
    new BigNumber(0).toString(),
    'callInterval should start uninitialized'
  )
  assert.equal(
    preCallbackGasLimit.toString(),
    new BigNumber(0).toString(),
    'callbackGAsLimit should start uninitialized'
  )
  assert.equal(preQueryString, '', 'queryString should start uninitialized')
}

const testSetCurrencySettings = async (exr, config) => {
  const callInterval = new BigNumber(60)
  const callbackGasLimit = new BigNumber(20e9)
  const queryString = 'https://domain.com/api/?base=ETH&to=USD'

  const [
    preCallInterval,
    preCallbackGasLimit,
    preQueryString
  ] = await exr.getCurrencySettingsReadable('USD')

  await exr.setCurrencySettings(
    'USD',
    queryString,
    callInterval,
    callbackGasLimit,
    config
  )

  const [
    postCallInterval,
    postCallbackGasLimit,
    postQueryString
  ] = await exr.getCurrencySettingsReadable('USD')

  assert(
    preCallInterval != postCallInterval,
    'postCallInterval should not match uninitialized value'
  )
  assert(
    preCallbackGasLimit != postCallbackGasLimit,
    'postCallbackGasLimit should not match uninitialized value'
  )
  assert(
    preQueryString != postQueryString,
    'postQueryString should not match uninitialized value'
  )

  assert.equal(
    postCallInterval.toString(),
    callInterval.toString(),
    'the postCallInterval should match the set value'
  )
  assert.equal(
    postCallbackGasLimit.toString(),
    callbackGasLimit.toString(),
    'the postCallbackGasLimit should match the set value'
  )
  assert.equal(
    postQueryString,
    queryString,
    'the postQueryString should match the set value'
  )
}

const testSettingsExists = async (exr, queryType) => {
  const [
    callInterval,
    callbackGasLimit,
    queryString
  ] = await exr.getCurrencySettingsReadable(queryType)
  assert(callbackGasLimit.greaterThan(0), 'callbackGasLimit uninitialized')
  assert(queryString !== '', 'queryString uninitialized')
  if (callInterval.equals(0)) {
    // eslint-disable-next-line
    console.log('callInterval set to 0, are you sure this should be like this?')
  }
}

const testFetchRate = async (reg, exr, queryType, config) => {
  await testSettingsExists(exr, queryType)
  // const preQueryType = await exr.queryTypes(queryType)
  await exr.fetchRate(queryType, config)
  // const postQueryType = await exr.queryTypes(queryType)
}

const testSetRate = async (exr, exp) => {
  const pendingQueryId = await exp.pendingTestQueryId()
  await exp.simulate__callback(pendingQueryId, '100')
  // const rate = await exr.getRate('USD')
}

module.exports = {
  setupContracts,
  testUninitializedSettings,
  testSetCurrencySettings,
  testFetchRate,
  testSettingsExists,
  testSetRate
}
