const { testWillThrow } = require('../helpers/general')
const {
  setupContracts,
  testUninitializedSettings,
  testSetCurrencySettings,
  testFetchRate,
  testSetRate
} = require('../helpers/exr')

describe('when interacting with ExchangeRates', () => {
  contract('ExchangeRates/ExchangeRatesProviderStub', accounts => {
    const owner = accounts[0]
    const notOwner = accounts[1]
    let exr
    let exp
    let reg

    before('setup contracts', async () => {
      const contracts = await setupContracts()
      reg = contracts.reg
      exr = contracts.exr
      exp = contracts.exp
    })

    it('should start with uninitialized settings', async () => {
      await testUninitializedSettings(exr)
    })

    it('should set rate settings', async () => {
      testSetCurrencySettings(exr, { from: owner })
    })

    it('should NOT set rate settings as NOT owner', async () => {
      await testWillThrow(testSetCurrencySettings, [exr, { from: notOwner }])
    })

    it('should fetch rate', async () => {
      await testFetchRate(reg, exr, 'USD', { from: owner, value: 1e18 })
    })

    it('should have rates set by the exRatesProvider', async () => {
      await testSetRate(exr, exp)
    })
  })
})

/*
  TODO: test the following:

  EXCHANGE RATES:
  setRateSettings
  fetchRate

  PROVIDER:
  simulate__callback
*/
