const {
  owner,
  broker,
  custodian,
  defaultName,
  defaultSymbol,
  defaultFiatCurrency,
  defaultFundingTimeout,
  defaultActivationTimeout,
  defaultFundingGoal,
  defaultFiatRate,
  getDefaultStartTime,
  setupEcosystem,
  testSetCurrencyRate,
  testProxyInitialization,
  defaultTotalSupply
} = require('../../helpers/poa')
const { testWillThrow, addressZero } = require('../../helpers/general.js')
const BigNumber = require('bignumber.js')

describe('when initializing PoaToken', () => {
  contract('PoaToken', () => {
    let reg
    let exr
    let exp
    let pmr

    beforeEach('setup contracts', async () => {
      const contracts = await setupEcosystem()

      reg = contracts.reg
      exr = contracts.exr
      exp = contracts.exp
      pmr = contracts.pmr
    })

    it.only('should start with the right values', async () => {
      await testSetCurrencyRate(
        exr,
        exp,
        defaultFiatCurrency,
        defaultFiatRate,
        {
          from: owner,
          value: 1e18
        }
      )

      await testProxyInitialization(reg, pmr, [
        defaultName,
        defaultSymbol,
        defaultFiatCurrency,
        custodian,
        defaultTotalSupply,
        await getDefaultStartTime(),
        defaultFundingTimeout,
        defaultActivationTimeout,
        defaultFundingGoal,
        { from: broker }
      ])
    })

    it('should NOT setup more than once', async () => {
      await testSetCurrencyRate(
        exr,
        exp,
        defaultFiatCurrency,
        defaultFiatRate,
        {
          from: owner,
          value: 1e18
        }
      )

      await testProxyInitialization(reg, pmr, [
        defaultName,
        defaultSymbol,
        defaultFiatCurrency,
        custodian,
        defaultTotalSupply,
        await getDefaultStartTime(),
        defaultFundingTimeout,
        defaultActivationTimeout,
        defaultFundingGoal,
        {
          from: broker
        }
      ])

      await testWillThrow(testProxyInitialization, [
        reg,
        pmr,
        [
          defaultName,
          defaultSymbol,
          defaultFiatCurrency,
          custodian,
          defaultTotalSupply,
          await getDefaultStartTime(),
          defaultFundingTimeout,
          defaultActivationTimeout,
          defaultFundingGoal,
          {
            from: broker
          }
        ]
      ])
    })

    it('should NOT initialize with a NON ready fiatRate', async () => {
      await testWillThrow(testProxyInitialization, [
        reg,
        pmr,
        [
          defaultName,
          defaultSymbol,
          defaultFiatCurrency,
          custodian,
          defaultTotalSupply,
          await getDefaultStartTime(),
          defaultFundingTimeout,
          defaultActivationTimeout,
          defaultFundingGoal,
          { from: broker }
        ]
      ])
    })

    it('should NOT initialize with a NON ready fiatRate', async () => {
      await testWillThrow(testProxyInitialization, [
        reg,
        pmr,
        [
          defaultName,
          defaultSymbol,
          defaultFiatCurrency,
          custodian,
          defaultTotalSupply,
          await getDefaultStartTime(),
          defaultFundingTimeout,
          defaultActivationTimeout,
          defaultFundingGoal,
          { from: broker }
        ]
      ])
    })

    it('should NOT initialize with < 3 character ascii char name', async () => {
      await testSetCurrencyRate(
        exr,
        exp,
        defaultFiatCurrency,
        defaultFiatRate,
        {
          from: owner,
          value: 1e18
        }
      )

      await testWillThrow(testProxyInitialization, [
        reg,
        pmr,
        [
          'is',
          defaultSymbol,
          defaultFiatCurrency,
          custodian,
          defaultTotalSupply,
          await getDefaultStartTime(),
          defaultFundingTimeout,
          defaultActivationTimeout,
          defaultFundingGoal,
          { from: broker }
        ]
      ])
    })

    it('should NOT initialize with < 3 character ascii char symbol', async () => {
      await testSetCurrencyRate(
        exr,
        exp,
        defaultFiatCurrency,
        defaultFiatRate,
        {
          from: owner,
          value: 1e18
        }
      )

      await testWillThrow(testProxyInitialization, [
        reg,
        pmr,
        [
          defaultName,
          'US',
          defaultFiatCurrency,
          custodian,
          defaultTotalSupply,
          await getDefaultStartTime(),
          defaultFundingTimeout,
          defaultActivationTimeout,
          defaultFundingGoal,
          { from: broker }
        ]
      ])
    })

    it('should NOT initialize with < 3 character ascii char fiatCurrency', async () => {
      await testSetCurrencyRate(
        exr,
        exp,
        defaultFiatCurrency,
        defaultFiatRate,
        {
          from: owner,
          value: 1e18
        }
      )

      await testWillThrow(testProxyInitialization, [
        reg,
        pmr,
        [
          defaultName,
          defaultSymbol,
          'US',
          custodian,
          defaultTotalSupply,
          await getDefaultStartTime(),
          defaultFundingTimeout,
          defaultActivationTimeout,
          defaultFundingGoal,
          { from: broker }
        ]
      ])
    })

    it('should NOT initialize when NOT sent from listed broker', async () => {
      await testSetCurrencyRate(
        exr,
        exp,
        defaultFiatCurrency,
        defaultFiatRate,
        {
          from: owner,
          value: 1e18
        }
      )

      await testWillThrow(testProxyInitialization, [
        reg,
        pmr,
        [
          defaultName,
          defaultSymbol,
          defaultFiatCurrency,
          custodian,
          defaultTotalSupply,
          await getDefaultStartTime(),
          defaultFundingTimeout,
          defaultActivationTimeout,
          defaultFundingGoal,
          { from: custodian }
        ]
      ])
    })

    it('should NOT initialize with address(0) or null for custodian', async () => {
      await testSetCurrencyRate(
        exr,
        exp,
        defaultFiatCurrency,
        defaultFiatRate,
        {
          from: owner,
          value: 1e18
        }
      )

      await testWillThrow(testProxyInitialization, [
        reg,
        pmr,
        [
          defaultName,
          defaultSymbol,
          defaultFiatCurrency,
          addressZero,
          defaultTotalSupply,
          await getDefaultStartTime(),
          defaultFundingTimeout,
          defaultActivationTimeout,
          defaultFundingGoal,
          { from: broker }
        ]
      ])

      await testWillThrow(testProxyInitialization, [
        reg,
        pmr,
        [
          defaultName,
          defaultSymbol,
          defaultFiatCurrency,
          null,
          defaultTotalSupply,
          await getDefaultStartTime(),
          defaultFundingTimeout,
          defaultActivationTimeout,
          defaultFundingGoal,
          { from: broker }
        ]
      ])
    })

    it('should NOT initialize with totalSupply < 1e18 or null', async () => {
      await testSetCurrencyRate(
        exr,
        exp,
        defaultFiatCurrency,
        defaultFiatRate,
        {
          from: owner,
          value: 1e18
        }
      )

      await testWillThrow(testProxyInitialization, [
        reg,
        pmr,
        [
          defaultName,
          defaultSymbol,
          defaultFiatCurrency,
          custodian,
          9e17,
          await getDefaultStartTime(),
          defaultFundingTimeout,
          defaultActivationTimeout,
          defaultFundingGoal,
          { from: broker }
        ]
      ])

      await testWillThrow(testProxyInitialization, [
        reg,
        pmr,
        [
          defaultName,
          defaultSymbol,
          defaultFiatCurrency,
          custodian,
          null,
          await getDefaultStartTime(),
          defaultFundingTimeout,
          defaultActivationTimeout,
          defaultFundingGoal
        ]
      ])
    })

    it('should NOT initialize with startTime before now', async () => {
      await testSetCurrencyRate(
        exr,
        exp,
        defaultFiatCurrency,
        defaultFiatRate,
        {
          from: owner,
          value: 1e18
        }
      )

      await testWillThrow(testProxyInitialization, [
        reg,
        pmr,
        [
          defaultName,
          defaultSymbol,
          defaultFiatCurrency,
          custodian,
          defaultTotalSupply,
          // simulate day before
          new BigNumber(Date.now()).div(1000).sub(60 * 60 * 24),
          defaultFundingTimeout,
          defaultActivationTimeout,
          defaultFundingGoal
        ]
      ])
    })

    it('should NOT initialize with fundingTimeout less than 1 day', async () => {
      await testSetCurrencyRate(
        exr,
        exp,
        defaultFiatCurrency,
        defaultFiatRate,
        {
          from: owner,
          value: 1e18
        }
      )

      await testWillThrow(testProxyInitialization, [
        reg,
        pmr,
        [
          defaultName,
          defaultSymbol,
          defaultFiatCurrency,
          custodian,
          defaultTotalSupply,
          await getDefaultStartTime(),
          // simulate 1 second less than a day
          new BigNumber(60)
            .mul(60)
            .mul(24)
            .sub(1),
          defaultActivationTimeout,
          defaultFundingGoal
        ]
      ])
    })

    it('should NOT initialize with activationTimeout less than 7 days', async () => {
      await testSetCurrencyRate(
        exr,
        exp,
        defaultFiatCurrency,
        defaultFiatRate,
        {
          from: owner,
          value: 1e18
        }
      )

      await testWillThrow(testProxyInitialization, [
        reg,
        pmr,
        [
          defaultName,
          defaultSymbol,
          defaultFiatCurrency,
          custodian,
          defaultTotalSupply,
          await getDefaultStartTime(),
          // simulate 1 second less than a day
          new BigNumber(60)
            .mul(60)
            .mul(24)
            .mul(7)
            .sub(1),
          new BigNumber(60)
            .mul(60)
            .mul(24)
            .mul(7)
            .sub(1),
          defaultFundingGoal
        ]
      ])
    })

    it('should NOT initialize with fundingGoal less than 1', async () => {
      await testSetCurrencyRate(
        exr,
        exp,
        defaultFiatCurrency,
        defaultFiatRate,
        {
          from: owner,
          value: 1e18
        }
      )

      await testWillThrow(testProxyInitialization, [
        reg,
        pmr,
        [
          defaultName,
          defaultSymbol,
          defaultFiatCurrency,
          custodian,
          defaultTotalSupply,
          await getDefaultStartTime(),
          defaultFundingTimeout,
          defaultActivationTimeout,
          0
        ]
      ])
    })
  })
})
