const PoaTokenConcept = artifacts.require('PoaTokenConcept')
const {
  owner,
  broker,
  custodian,
  bbkBonusAddress,
  bbkContributors,
  whitelistedPoaBuyers,
  bbkTokenDistAmount,
  actRate,
  defaultName,
  defaultSymbol,
  defaultFiatCurrency,
  defaultTimeout,
  defaultTotalSupply,
  defaultFundingGoal,
  defaultFiatRate,
  getDefaultStartTime,
  setupEcosystem,
  testSetCurrencyRate,
  setupPoaAndEcosystem,
  testInitialization,
  testWeiToFiatCents,
  testFiatCentsToWei,
  testWeiToTokens,
  testTokensToWei,
  testCalculateFee,
  testStartSale,
  testBuyTokens,
  determineNeededTimeTravel,
  testBuyRemainingTokens,
  testActivate,
  testBrokerClaim,
  testPayout,
  testClaimAllPayouts
} = require('../helpers/poac')
const {
  testWillThrow,
  addressZero,
  timeTravel,
  gasPrice
} = require('../helpers/general.js')
const BigNumber = require('bignumber.js')

describe('when initializing PoaTokenConcept', () => {
  contract('PoaTokenConcept', () => {
    let reg
    let exr
    let exp

    beforeEach('setup contracts', async () => {
      const contracts = await setupEcosystem()

      reg = contracts.reg
      exr = contracts.exr
      exp = contracts.exp
    })

    it('should start with the right values', async () => {
      await testInitialization(exr, exp, reg)
    })

    it('should NOT initialize with a NON ready fiatRate', async () => {
      await testWillThrow(PoaTokenConcept.new, [
        defaultName,
        defaultSymbol,
        defaultFiatCurrency,
        broker,
        custodian,
        reg.address,
        await getDefaultStartTime(),
        defaultTimeout,
        defaultTotalSupply,
        defaultFundingGoal
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

      await testWillThrow(PoaTokenConcept.new, [
        'is',
        defaultSymbol,
        defaultFiatCurrency,
        broker,
        custodian,
        reg.address,
        await getDefaultStartTime(),
        defaultTimeout,
        defaultTotalSupply,
        defaultFundingGoal
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

      await testWillThrow(PoaTokenConcept.new, [
        defaultName,
        'US',
        defaultFiatCurrency,
        broker,
        custodian,
        reg.address,
        await getDefaultStartTime(),
        defaultTimeout,
        defaultTotalSupply,
        defaultFundingGoal
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

      await testWillThrow(PoaTokenConcept.new, [
        defaultName,
        defaultSymbol,
        'US',
        broker,
        custodian,
        reg.address,
        await getDefaultStartTime(),
        defaultTimeout,
        defaultTotalSupply,
        defaultFundingGoal
      ])
    })

    it('should NOT initialize with address(0) or null for broker', async () => {
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

      await testWillThrow(PoaTokenConcept.new, [
        defaultName,
        defaultSymbol,
        defaultFiatCurrency,
        addressZero,
        custodian,
        reg.address,
        await getDefaultStartTime(),
        defaultTimeout,
        defaultTotalSupply,
        defaultFundingGoal
      ])

      await testWillThrow(PoaTokenConcept.new, [
        defaultName,
        defaultSymbol,
        defaultFiatCurrency,
        null,
        custodian,
        reg.address,
        await getDefaultStartTime(),
        defaultTimeout,
        defaultTotalSupply,
        defaultFundingGoal
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

      await testWillThrow(PoaTokenConcept.new, [
        defaultName,
        defaultSymbol,
        defaultFiatCurrency,
        broker,
        addressZero,
        reg.address,
        await getDefaultStartTime(),
        defaultTimeout,
        defaultTotalSupply,
        defaultFundingGoal
      ])

      await testWillThrow(PoaTokenConcept.new, [
        defaultName,
        defaultSymbol,
        defaultFiatCurrency,
        broker,
        null,
        reg.address,
        await getDefaultStartTime(),
        defaultTimeout,
        defaultTotalSupply,
        defaultFundingGoal
      ])
    })

    it('should NOT initialize with address(0) or null for registry', async () => {
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

      await testWillThrow(PoaTokenConcept.new, [
        defaultName,
        defaultSymbol,
        defaultFiatCurrency,
        broker,
        custodian,
        addressZero,
        await getDefaultStartTime(),
        defaultTimeout,
        defaultTotalSupply,
        defaultFundingGoal
      ])

      await testWillThrow(PoaTokenConcept.new, [
        defaultName,
        defaultSymbol,
        defaultFiatCurrency,
        broker,
        custodian,
        null,
        await getDefaultStartTime(),
        defaultTimeout,
        defaultTotalSupply,
        defaultFundingGoal
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

      await testWillThrow(PoaTokenConcept.new, [
        defaultName,
        defaultSymbol,
        defaultFiatCurrency,
        broker,
        custodian,
        reg.address,
        // simulate day before
        new BigNumber(Date.now()).div(1000).sub(60 * 60 * 24),
        defaultTimeout,
        defaultTotalSupply,
        defaultFundingGoal
      ])
    })

    it('should NOT initialize with timeout less than 1 day', async () => {
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

      await testWillThrow(PoaTokenConcept.new, [
        defaultName,
        defaultSymbol,
        defaultFiatCurrency,
        broker,
        custodian,
        reg.address,
        await getDefaultStartTime(),
        // simulate 1 second less than a day
        new BigNumber(60)
          .mul(60)
          .mul(24)
          .sub(1),
        defaultTotalSupply,
        defaultFundingGoal
      ])
    })

    it('should NOT initialize with totalSupply less than fundingGoal', async () => {
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

      await testWillThrow(PoaTokenConcept.new, [
        defaultName,
        defaultSymbol,
        defaultFiatCurrency,
        broker,
        custodian,
        reg.address,
        await getDefaultStartTime(),
        defaultTimeout,
        defaultFundingGoal.sub(1),
        defaultFundingGoal
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

      await testWillThrow(PoaTokenConcept.new, [
        defaultName,
        defaultSymbol,
        defaultFiatCurrency,
        broker,
        custodian,
        reg.address,
        await getDefaultStartTime(),
        defaultTimeout,
        defaultTotalSupply,
        0
      ])
    })
  })
})

// TODO: very nervous about integer division here...
// need to find out how much is being lost and at what point rates/values
// will only return 0...
describe('when testing utility functions', () => {
  contract('PoaTokenConcept', () => {
    let poac

    before('setup contracts', async () => {
      const defaultStartTime = await getDefaultStartTime()
      const contracts = await setupPoaAndEcosystem(defaultStartTime)
      poac = contracts.poac
    })

    it('should use weiToFiatCents to return correct value', async () => {
      await testWeiToFiatCents(poac, new BigNumber('1e18'))
    })

    it('should use fiatCentsToWei to return correct value', async () => {
      await testFiatCentsToWei(poac, new BigNumber('3e4'))
    })

    it('should use weiToTokens to calculate correct value', async () => {
      await testWeiToTokens(poac, new BigNumber('1e18'))
    })

    it('should use tokensToWei to calculate correct value', async () => {
      await testTokensToWei(poac, new BigNumber('1e18'))
    })

    it('should calculate the correct fee', async () => {
      await testCalculateFee(poac, new BigNumber('1e18'))
    })
  })
})

describe("when going through Poa's normal flow", async () => {
  contract('PoaTokenConcept', () => {
    let defaultStartTime
    let fmr
    let poac

    before('setup contracts', async () => {
      defaultStartTime = await getDefaultStartTime()
      const contracts = await setupPoaAndEcosystem(defaultStartTime)
      poac = contracts.poac
      fmr = contracts.fmr
    })

    it('should move from PreFunding to Funding after startTime', async () => {
      await timeTravel(determineNeededTimeTravel(defaultStartTime))
      await testStartSale(poac)
    })

    it('should allow buying', async () => {
      await testBuyTokens(poac, {
        from: whitelistedPoaBuyers[0],
        value: 5e17,
        gasPrice
      })
    })

    it('should buy all remaining tokens, moving to Pending', async () => {
      await testBuyRemainingTokens(poac, {
        from: whitelistedPoaBuyers[1],
        gasPrice
      })
    })

    it('should activate with ipfs hash from custodian', async () => {
      await testActivate(
        poac,
        fmr,
        'QmSUfCtXgb59G9tczrz2WuHNAbecV55KRBGXBbZkou5RtE',
        {
          from: custodian
        }
      )
    })

    it('should claim contract funding as broker', async () => {
      await testBrokerClaim(poac)
    })

    it('should payout from custodian', async () => {
      await testPayout(poac, fmr, {
        from: custodian,
        value: 2e18,
        gasPrice
      })
    })

    it('should allow all token holders to claim', async () => {
      await testClaimAllPayouts(poac, whitelistedPoaBuyers)
    })
  })
})

describe('when in PreFunding (stage 0)', async () => {
  contract('PoaTokenConcept', () => {
    let defaultStartTime
    let poac

    before('setup contracts', async () => {
      const currentBlock = await web3.eth.getBlock(web3.eth.blockNumber)
      const blockTime = currentBlock.timestamp
      const realTime = new BigNumber(Date.now())
        .div(1000)
        .floor()
        .toNumber()

      console.log(
        'block timestamp: ',
        blockTime,
        'real time: ',
        realTime,
        'blockTime > realTime: ',
        blockTime > realTime
      )
      defaultStartTime = await getDefaultStartTime()
      const contracts = await setupPoaAndEcosystem(defaultStartTime)
      poac = contracts.poac
    })

    it('should NOT unpause', async () => {
      await testWillThrow(poac.unpause, [{ from: owner }])
    })

    it('should NOT move to funding before startTime', async () => {
      await testWillThrow(testStartSale, [poac])
    })

    it('should move to Stages.Funding when after startTime', async () => {
      await timeTravel(determineNeededTimeTravel(defaultStartTime))
      await testStartSale(poac)
    })
  })
})

describe('when in Funding (stage 1)', () => {
  contract('PoaTokenConcept', () => {
    let poac

    before('setup contracts', async () => {
      const defaultStartTime = await getDefaultStartTime()
      const contracts = await setupPoaAndEcosystem(defaultStartTime)
      poac = contracts.poac

      await timeTravel(determineNeededTimeTravel(defaultStartTime))
      await testStartSale(poac)
    })

    it('should do stuff', () => {
      assert(true)
    })
  })
})

/*
lifecycle methods:
  unpause:
    Active
  startSale:
    PreFunding
  Buy:
    Funding
  setFailed:
    Funding
  activate:
    Pending
  terminate:
    Terminated
  reclaim:
    Failed
  payout:
    Active
    Terminated
  claim:
    Active
  updateProofOfCustody:
    Active
    Terminated

other:
  currenctPayout
  settleUnclaimedPerTokenPayouts
  fallback
  transfer
  transferFrom
*/
