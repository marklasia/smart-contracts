const PoaTokenConcept = artifacts.require('PoaTokenConcept')
const {
  owner,
  broker,
  custodian,
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
  defaultIpfsHash,
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
  testClaim,
  testClaimAllPayouts,
  testFirstReclaim,
  testReclaim,
  timeoutContract,
  testSetFailed,
  testReclaimAll,
  testPaused,
  testPause,
  testUnpause,
  testFallback
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
      const contracts = await setupPoaAndEcosystem()
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
    let fmr
    let poac

    before('setup contracts', async () => {
      const contracts = await setupPoaAndEcosystem()
      poac = contracts.poac
      fmr = contracts.fmr
    })

    it('should move from PreFunding to Funding after startTime', async () => {
      const neededTime = await determineNeededTimeTravel(poac)
      await timeTravel(neededTime)
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
      await testActivate(poac, fmr, defaultIpfsHash, {
        from: custodian
      })
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
    let poac

    before('setup contracts', async () => {
      const contracts = await setupPoaAndEcosystem()
      poac = contracts.poac
    })

    // BEGIN SHOULD THROW FUNCTIONS

    it('should NOT unpause', async () => {
      await testWillThrow(poac.unpause, [{ from: owner }])
    })

    it('should NOT move to funding before startTime, EVEN if owner', async () => {
      await testWillThrow(testStartSale, [poac, { from: owner }])
    })

    // END SHOULD THROW FUNCTIONS

    it('should allow ANYONE to move to Stages.Funding when after startTime', async () => {
      const neededTime = await determineNeededTimeTravel(
        poac,
        whitelistedPoaBuyers[0]
      )
      await timeTravel(neededTime)
      await testStartSale(poac)
    })
  })
})

describe('when in Funding (stage 1)', () => {
  contract('PoaTokenConcept', () => {
    let poac

    before('setup contracts', async () => {
      const contracts = await setupPoaAndEcosystem()
      poac = contracts.poac

      const neededTime = await determineNeededTimeTravel(poac)
      await timeTravel(neededTime)
      await testStartSale(poac)
    })

    it('should allow buying', async () => {
      await testBuyTokens(poac, {
        from: whitelistedPoaBuyers[0],
        value: 5e17,
        gasPrice
      })
    })

    it('should move into pending when all tokens are bought', async () => {
      await testBuyRemainingTokens(poac, {
        from: whitelistedPoaBuyers[1],
        gasPrice
      })
    })
  })
})

describe('when in Pending (stage 2)', () => {
  contract('PoaTokenConcept', () => {
    let poac
    let fmr

    before('setup contracts', async () => {
      const contracts = await setupPoaAndEcosystem()
      poac = contracts.poac
      fmr = contracts.poac

      // move into Funding
      const neededTime = await determineNeededTimeTravel(poac)
      await timeTravel(neededTime)
      await testStartSale(poac)

      // move into Pending
      await testBuyRemainingTokens(poac, {
        from: whitelistedPoaBuyers[1],
        gasPrice
      })
    })

    it('should move into Active when activated', async () => {
      await testActivate(poac, fmr, defaultIpfsHash, {
        from: custodian
      })
    })
  })
})

describe('when in Failed (stage 3)', () => {
  contract('PoaTokenConcept', () => {
    const tokenBuyAmount = new BigNumber(5e17)
    let poac

    beforeEach('setup contracts', async () => {
      const contracts = await setupPoaAndEcosystem()
      poac = contracts.poac

      // move into Funding
      const neededTime = await determineNeededTimeTravel(poac)
      await timeTravel(neededTime)
      await testStartSale(poac)

      // purchase tokens to reclaim when failed
      await testBuyTokens(poac, {
        from: whitelistedPoaBuyers[0],
        value: tokenBuyAmount,
        gasPrice
      })
      await testBuyTokens(poac, {
        from: whitelistedPoaBuyers[1],
        value: tokenBuyAmount,
        gasPrice
      })

      await timeoutContract(poac)
    })

    it('should setFailed', async () => {
      await testSetFailed(poac)
    })

    it('should hit checkTimeout when reclaiming after timeout', async () => {
      await testFirstReclaim(poac, { from: whitelistedPoaBuyers[0] })
    })

    it('should allow subseequent reclaiming after timeout', async () => {
      await testFirstReclaim(poac, { from: whitelistedPoaBuyers[0] })
      await testReclaim(poac, { from: whitelistedPoaBuyers[1] })
    })

    it('should reclaim all tokens', async () => {
      await testReclaimAll(poac, whitelistedPoaBuyers)
    })
  })
})

describe.only('when in Active (stage 4)', () => {
  contract('PoaTokenConcept', () => {
    let poac
    let fmr

    before('setup contracts', async () => {
      const contracts = await setupPoaAndEcosystem()
      poac = contracts.poac
      fmr = contracts.fmr

      // move into Funding
      const neededTime = await determineNeededTimeTravel(poac)
      await timeTravel(neededTime)
      await testStartSale(poac)

      // move into Pending
      await testBuyTokens(poac, {
        from: whitelistedPoaBuyers[0],
        value: 1e18,
        gasPrice
      })
      await testBuyRemainingTokens(poac, {
        from: whitelistedPoaBuyers[1],
        gasPrice
      })

      // move into Active
      await testActivate(poac, fmr, defaultIpfsHash, {
        from: custodian
      })

      // clean out broker balance for easier debugging
      await testBrokerClaim(poac)
    })

    it('should be unpaused', async () => {
      await testPaused(poac, false)
    })

    it('should NOT unpause when already unpaused', async () => {
      await testWillThrow(testUnpause, [poac, { from: owner }])
    })

    it('should NOT pause if NOT owner', async () => {
      await testWillThrow(testPause, [poac, { from: whitelistedPoaBuyers[0] }])
    })

    it('should pause if owner', async () => {
      await testPause(poac, { from: owner })
    })

    it('should NOT pause if already paused', async () => {
      await testWillThrow(testPause, [poac, { from: owner }])
    })

    it('should NOT unpause if NOT owner', async () => {
      await testWillThrow(testUnpause, [
        poac,
        { from: whitelistedPoaBuyers[0] }
      ])
    })

    it('should unpause if owner', async () => {
      await testUnpause(poac, { from: owner })
    })

    it('should NOT startSale, even if owner', async () => {
      await testWillThrow(testStartSale, [poac, { from: owner }])
    })

    it('should NOT buy, even if whitelisted', async () => {
      await testWillThrow(testBuyTokens, [
        poac,
        { from: whitelistedPoaBuyers[0], value: 3e17, gasPrice }
      ])
    })

    it('should NOT setFailed, even if owner', async () => {
      await testWillThrow(testSetFailed, [poac, { from: owner }])
    })

    it('should NOT activate, even if custodian', async () => {
      await testWillThrow(testActivate, [
        poac,
        fmr,
        defaultIpfsHash,
        { from: custodian }
      ])
    })

    it('should NOT reclaim, even if owning tokens', async () => {
      await testWillThrow(testReclaim, [
        poac,
        { from: whitelistedPoaBuyers[0] }
      ])
    })

    it('should NOT allow fallback to run', async () => {
      await testFallback({
        from: whitelistedPoaBuyers[0],
        value: 3e17,
        to: poac.address
      })
    })

    // start core stage functionality

    it('should NOT claim if no payouts', async () => {
      await testWillThrow(testClaim, [poac, whitelistedPoaBuyers[0]])
    })

    it('should payout as custodian', async () => {
      await testPayout(poac, fmr, { value: 2e18, from: custodian, gasPrice })
    })

    it('should NOT payout as custodian if payout is too low', async () => {

    })

    it('should NOT payout as NOT custodian', async () => {

    })

    it('should claim if payout has been made', async () => {
      await testClaim(poac, whitelistedPoaBuyers[0])
    })

    it('should NOT update proofOfCustody if NOT custodian', async () => {

    })

    it('should NOT update proofOfCustody if NOT valid ipfsHash', async () => {

    })

    it('should transfer', async () => {

    })

    it('should approve', async () => {

    })

    it('should transferFrom', async () => {

    })

    it('should return the correct currentPayout', async () => {

    })

    // start core stage functionality

    /*
    tovarish
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
      transfer
        Active
      transferFrom
        Active
      approve
        Active
    other:
      currenctPayout
      settleUnclaimedPerTokenPayouts
      fallback
    */
  })
})

describe('when in Terminated (stage 5)', () => {
  contract('PoaTokenConcept', () => {
    let poac
    let fmr

    before('setup contracts', async () => {
      const contracts = await setupPoaAndEcosystem()
      poac = contracts.poac
      fmr = contracts.fmr

      // move into Funding
      const neededTime = await determineNeededTimeTravel(poac)
      await timeTravel(neededTime)
      await testStartSale(poac)

      // move into Pending
      await testBuyRemainingTokens(poac, {
        from: whitelistedPoaBuyers[1],
        gasPrice
      })

      // move into Active
      await testActivate(poac, fmr, defaultIpfsHash, {
        from: custodian
      })

      // clean out broker balance for easier debugging
      await testBrokerClaim(poac)

      // TODO: create helper to terminate
    })

    it('should do things', async () => {
      assert(true)
    })
  })
})

describe('when handling unhappy paths', async () => {
  contract('PoaTokenConcept', () => {
    let poac

    before('setup contracts', async () => {
      const contracts = await setupPoaAndEcosystem()
      poac = contracts.poac
    })

    it('should do things', async () => {
      await poac.stage()
      assert(true)
    })
  })
})
