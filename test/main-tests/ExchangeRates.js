const BigNumber = require('bignumber.js')
const { testWillThrow } = require('../helpers/general')
const {
  setupContracts,
  testUninitializedSettings,
  testSetCurrencySettings,
  testFetchRate,
  testSetRate,
  testToggleRates,
  testStringToBytes8,
  testToUpperCase,
  testToBytes32Array,
  testToLongString,
  testToShortString,
  testSelfDestruct,
  testGetRate,
  testToggleClearRateIntervals,
  testSetRateClearIntervals
} = require('../helpers/exr')

describe('when performing owner only functions', () => {
  contract('ExchangeRates/ExchangeRatesProviderStub', accounts => {
    const owner = accounts[0]
    const notOwner = accounts[1]
    const callInterval = new BigNumber(60)
    const callbackGasLimit = new BigNumber(20e9)
    const queryString = 'https://domain.com/api/?base=ETH&to=USD'
    const queryType = 'USD'
    let exr
    let exp

    before('setup contracts', async () => {
      const contracts = await setupContracts()
      exr = contracts.exr
      exp = contracts.exp
    })

    it('should start with uninitialized settings', async () => {
      await testUninitializedSettings(exr)
    })

    it('should NOT set rate settings as NOT owner', async () => {
      await testWillThrow(testSetCurrencySettings, [
        exr,
        queryType,
        callInterval,
        callbackGasLimit,
        queryString,
        { from: notOwner }
      ])
    })

    it('should set rate settings', async () => {
      await testSetCurrencySettings(
        exr,
        queryType,
        callInterval,
        callbackGasLimit,
        queryString,
        { from: owner }
      )
    })

    it('should NOT fetchRate when NOT owner', async () => {
      await testWillThrow(testFetchRate, [
        exr,
        exp,
        'USD',
        { from: notOwner, value: 1e18 }
      ])
    })

    it('should fetch rate', async () => {
      await testFetchRate(exr, exp, 'USD', { from: owner, value: 1e18 })
    })

    it('should have rates set by the exRatesProvider', async () => {
      await testSetRate(exr, exp, 100)
    })

    it('should stop rates when active', async () => {
      await testToggleRates(exr, false, { from: owner })
    })

    it('should start rates when inactive', async () => {
      await testToggleRates(exr, true, { from: owner })
    })

    it('should NOT toggle rates when NOT owner', async () => {
      await testWillThrow(testToggleRates, [exr, true, { from: notOwner }])
    })

    it('should toggle clear rate intervals when owner', async () => {
      await testToggleClearRateIntervals(exr, true, { from: owner })
    })

    it('should NOT toggle clear rate intervals when NOT owner', async () => {
      await testWillThrow(testToggleClearRateIntervals, [
        exr,
        true,
        { from: notOwner }
      ])
    })
  })
})

describe('when using utility functions', () => {
  contract('ExchangeRates', () => {
    let exr

    before('setup contracts', async () => {
      const contracts = await setupContracts()
      exr = contracts.exr
    })

    it('should turn a string into bytes8', async () => {
      await testStringToBytes8(exr, 'usd')
    })

    it('should NOT turn a string longer than 8 characters to bytes8', async () => {
      await testWillThrow(testStringToBytes8, [
        exr,
        'usd plus some more characters'
      ])
    })

    it('should return a string to uppercase', async () => {
      await testToUpperCase(exr, 'usd')
    })

    it('should return a string to uppercase, even if already uppercase', async () => {
      await testToUpperCase(exr, 'USD')
    })

    it('should turn a string into a bytes32 array with a length of 5', async () => {
      await testToBytes32Array(
        exr,
        'some long query string that is more than 32 characters long'
      )
    })

    it('should turn a bytes32 array with a length of 5 into a string', async () => {
      await testToLongString(
        exr,
        'some long query string that is more than 32 characters long'
      )
    })

    it('should turn a bytes8 into a string', async () => {
      await testToShortString(exr, 'test')
    })
  })
})

describe('when self destructing', async () => {
  contract('ExchangeRates/ExchangeRatesProviderStub', accounts => {
    const owner = accounts[0]
    const notOwner = accounts[1]
    let exr

    beforeEach('setup contracts', async () => {
      const contracts = await setupContracts()
      exr = contracts.exr
    })

    it('should selfDestruct', async () => {
      await testSelfDestruct(exr, owner)
    })

    it('should NOT selfDestruct if NOT owner', async () => {
      await testWillThrow(testSelfDestruct, [exr, notOwner])
    })
  })
})

describe('when trying various scenarios through different lifecycles', async () => {
  contract('ExchangeRates/ExchangeRatesProviderStub', accounts => {
    const owner = accounts[0]
    const callInterval = new BigNumber(60)
    const callbackGasLimit = new BigNumber(20e9)
    const queryString = 'https://domain.com/api/?base=ETH&to=USD'
    const queryType = 'USD'
    let exr
    let exp

    before('setup contracts', async () => {
      const contracts = await setupContracts()
      exr = contracts.exr
      exp = contracts.exp
    })

    it('should do things', async () => {
      let defaultRate = 100
      await testSetCurrencySettings(
        exr,
        queryType,
        callInterval,
        callbackGasLimit,
        queryString,
        { from: owner }
      )
      await testFetchRate(exr, exp, queryType, { from: owner, value: 1e18 })
      await testSetRate(exr, exp, defaultRate)
      await testGetRate(exr, defaultRate, queryType)
      await testToggleRates(exr, false, { from: owner })
      await testToggleClearRateIntervals(exr, true, { from: owner })
      defaultRate++
      await testSetRateClearIntervals(exr, exp, defaultRate)
    })
  })
})

/*
  TODO: test the intervals and other lifecycle stuff
  STILL NEED TO TEST
  fetchRate
  setRate
  setCurrencySettings
  getCurrencySettings (do a unit test)
  getCurrencySettingsReadable
  getRate
  toggleRatesActive
  clearRateIntervals

  process for testing regular usage:
    setCurrencySettings
    fetchRate
    setRate (through simulate__callback)
    getRate
    toggleRatesActive (false)
    simulate__callback
    toggleRatesActive (true)
    clearRateIntervals
    simulate__callback
    getCurrencySettingsReadable


  ALREADY TESTED
  toBytes8
  toUpperCase
  toBytes32Array
  toLongString
  selfDestruct
*/
