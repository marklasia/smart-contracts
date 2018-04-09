const assert = require('assert')
const BigNumber = require('bignumber.js')
const ExchangeRates = artifacts.require('ExchangeRates')
const ExchangeRatesProvider = artifacts.require(
  './stubs/ExchangeRatesProviderStub'
)
const Registry = artifacts.require('BrickblockContractRegistry')
const { sendTransaction, getEtherBalance, getGasUsed } = require('./general')

const trimBytes = string => string.replace(/\0/g, '')

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

const testSetCurrencySettings = async (
  exr,
  queryType,
  callInterval,
  callbackGasLimit,
  queryString,
  config
) => {
  const [
    preCallInterval,
    preCallbackGasLimit,
    preQueryString
  ] = await exr.getCurrencySettingsReadable('USD')

  await exr.setCurrencySettings(
    queryType,
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

const testToggleRates = async (exr, config) => {
  const preRatesActive = await exr.ratesActive()
  await exr.toggleRatesActive(config)
  const postRatesActive = await exr.ratesActive()

  assert(
    preRatesActive != postRatesActive,
    'preRatesActive should be toggled to postRAtesActive'
  )
}

const testStringToBytes8 = async (exr, stringInput) => {
  const bytes8 = await exr.toBytes8(stringInput)
  const bytes8ToString = web3.toAscii(bytes8)
  const bytes8StringTrimmed = trimBytes(bytes8ToString)
  assert.equal(
    stringInput,
    bytes8StringTrimmed,
    'the bytes8 returned should convert back to the same string'
  )
}

const testToUpperCase = async (exr, stringInput) => {
  const uppercase = await exr.toUpperCase(stringInput)

  assert.equal(
    stringInput.toUpperCase(),
    uppercase,
    'the returned string should be uppercase'
  )
}

const testToBytes32Array = async (exr, stringInput) => {
  const bytes32ArrayOutput = await exr.toBytes32Array(stringInput)
  const bytesArrayToString = bytes32ArrayOutput.reduce(
    (string, item) => trimBytes(string.concat(web3.toAscii(item))),
    ''
  )

  assert.equal(
    stringInput,
    bytesArrayToString,
    'the bytes32 array returned should convert back to the same string'
  )
}

const testToLongString = async (exr, stringToBeConverted) => {
  const bytes32Array = await exr.toBytes32Array(stringToBeConverted)
  const convertedString = await exr.toLongString(bytes32Array)

  assert.equal(
    stringToBeConverted,
    convertedString,
    'the string converted back from bytes32 array should match the string originally given'
  )
}

const testSelfDestruct = async (exr, caller) => {
  const owner = web3.eth.accounts[0]
  assert(
    caller != web3.eth.accounts[9],
    'please pick another account... cannot use this account for this test'
  )
  const funder = web3.eth.accounts[9]
  const preOwnerBalance = await getEtherBalance(owner)
  const preAlive = await exr.isAlive()
  await sendTransaction(web3, {
    from: funder,
    to: exr.address,
    value: 1e18
  })
  const preKillContractBalance = await getEtherBalance(exr.address)
  const tx = await exr.selfDestruct({ from: caller, gasPrice: 1e9 })
  const gasUsed = await getGasUsed(tx)
  const expectedOwnerBalance = preOwnerBalance
    .add(1e18)
    .sub(new BigNumber(gasUsed).mul(1e9))
  const postOwnerBalance = await getEtherBalance(owner)
  const postAlive = await exr.isAlive()

  assert(preAlive, 'the contract should be alive')
  assert(
    !postAlive,
    'the contract should NOT be alive after running selfDestruct'
  )

  assert.equal(
    preKillContractBalance.toString(),
    new BigNumber(1e18).toString(),
    'the balance of the contract should be 1e18'
  )
  assert.equal(
    expectedOwnerBalance.toString(),
    postOwnerBalance.toString(),
    'the owner balance should match the expected balance after self destruction'
  )
}

module.exports = {
  setupContracts,
  testUninitializedSettings,
  testSetCurrencySettings,
  testFetchRate,
  testSettingsExists,
  testSetRate,
  testToggleRates,
  testStringToBytes8,
  testToUpperCase,
  testToBytes32Array,
  testToLongString,
  testSelfDestruct
}
