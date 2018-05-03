const PoaTokenConcept = artifacts.require('PoaTokenConcept')
const {
  owner,
  broker,
  custodian,
  bbkContributors,
  whitelistedPoaBuyers,
  defaultName,
  defaultSymbol,
  defaultFiatCurrency,
  defaultFundingTimeout,
  defaultActivationTimeout,
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
  fundingTimeoutContract,
  activationTimeoutContract,
  testSetFailed,
  testReclaimAll,
  testPaused,
  testPause,
  testUnpause,
  testFallback,
  testUpdateProofOfCustody,
  testTransfer,
  testApprove,
  testTransferFrom,
  testTerminate,
  testChangeCustodianAddress,
  testBuyTokensMulti,
  getAccountInformation,
  testResetCurrencyRate
} = require('../helpers/poac')
const {
  testWillThrow,
  addressZero,
  timeTravel,
  gasPrice,
  areInRange,
  getEtherBalance
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
        defaultFundingTimeout,
        defaultActivationTimeout,
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
        defaultFundingTimeout,
        defaultActivationTimeout,
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
        defaultFundingTimeout,
        defaultActivationTimeout,
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
        defaultFundingTimeout,
        defaultActivationTimeout,
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
        defaultFundingTimeout,
        defaultActivationTimeout,
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
        defaultFundingTimeout,
        defaultActivationTimeout,
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
        defaultFundingTimeout,
        defaultActivationTimeout,
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
        defaultFundingTimeout,
        defaultActivationTimeout,
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
        defaultFundingTimeout,
        defaultActivationTimeout,
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
        defaultFundingTimeout,
        defaultActivationTimeout,
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
        defaultFundingTimeout,
        defaultActivationTimeout,
        defaultFundingGoal
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
        defaultFundingGoal
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
          .mul(7)
          .sub(1),
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
        defaultFundingTimeout,
        defaultActivationTimeout,
        0
      ])
    })
  })
})

describe('when testing stage independent functions', () => {
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

    it('should calculate correct fee', async () => {
      await testCalculateFee(poac, new BigNumber('1e18'))
    })

    it('should NOT changeCustodianAddress when NOT custodian', async () => {
      await testWillThrow(testChangeCustodianAddress, [
        poac,
        whitelistedPoaBuyers[1],
        { from: whitelistedPoaBuyers[2] }
      ])
    })

    it('should change changeCustodianAddress', async () => {
      await testChangeCustodianAddress(poac, whitelistedPoaBuyers[2], {
        from: custodian
      })
    })

    it('should NOT allow payable fallback to run', async () => {
      await testFallback({
        from: whitelistedPoaBuyers[0],
        value: 3e17,
        to: poac.address
      })
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
    let fmr

    before('setup contracts', async () => {
      const contracts = await setupPoaAndEcosystem()
      poac = contracts.poac
      fmr = contracts.fmr
    })

    it('should start paused', async () => {
      await testPaused(poac, true)
    })

    it('should NOT unpause, even if owner', async () => {
      await testWillThrow(testUnpause, [poac, { from: owner }])
    })

    it('should NOT buy, even if whitelisted', async () => {
      await testWillThrow(testBuyTokens, [
        poac,
        { from: whitelistedPoaBuyers[0], value: 3e17, gasPrice }
      ])
    })

    it('should NOT setFailed', async () => {
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

    it('should NOT terminate, even if custodian', async () => {
      await testWillThrow(testTerminate, [poac, { from: custodian }])
    })

    it('should NOT reclaim, even if owning tokens', async () => {
      await testWillThrow(testReclaim, [
        poac,
        { from: whitelistedPoaBuyers[0] }
      ])
    })

    it('should NOT payout, even if custodian', async () => {
      await testWillThrow(testPayout, [
        poac,
        fmr,
        { from: custodian, value: 1e18, gasPrice }
      ])
    })

    it('should NOT claim since there are no payouts', async () => {
      await testWillThrow(testClaim, [poac, { from: whitelistedPoaBuyers[0] }])
    })

    it('should NOT updateProofOfCustody, even if valid and from custodian', async () => {
      await testWillThrow(testUpdateProofOfCustody, [
        poac,
        defaultIpfsHash,
        { from: custodian }
      ])
    })

    it('should NOT transfer', async () => {
      await testWillThrow(testTransfer, [
        poac,
        whitelistedPoaBuyers[1],
        1e17,
        {
          from: whitelistedPoaBuyers[0]
        }
      ])
    })

    it('should NOT approve', async () => {
      await testWillThrow(testApprove, [
        poac,
        whitelistedPoaBuyers[1],
        1e17,
        {
          from: whitelistedPoaBuyers[0]
        }
      ])
    })

    it('should NOT transferFrom', async () => {
      // in theory would need approval put here for the sake of demonstrating
      // that approval was attempted as well.
      await testWillThrow(testApprove, [
        poac,
        whitelistedPoaBuyers[1],
        1e17,
        {
          from: whitelistedPoaBuyers[0]
        }
      ])
      await testWillThrow(testTransferFrom, [
        poac,
        whitelistedPoaBuyers[0],
        bbkContributors[0],
        1e17,
        {
          from: whitelistedPoaBuyers[1]
        }
      ])
    })

    // start core stage functionality

    it('should NOT move to funding before startTime, EVEN if owner', async () => {
      await testWillThrow(testStartSale, [poac, { from: owner }])
    })

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
    let fmr

    before('setup contracts', async () => {
      const contracts = await setupPoaAndEcosystem()
      poac = contracts.poac
      fmr = contracts.fmr

      const neededTime = await determineNeededTimeTravel(poac)
      await timeTravel(neededTime)
      await testStartSale(poac)
    })

    it('should start paused', async () => {
      await testPaused(poac, true)
    })

    it('should NOT unpause, even if owner', async () => {
      await testWillThrow(testUnpause, [poac, { from: owner }])
    })

    it('should NOT startSale, even if owner', async () => {
      await testWillThrow(testStartSale, [poac, { from: owner }])
    })

    it('should NOT setFailed', async () => {
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

    it('should NOT terminate, even if custodian', async () => {
      await testWillThrow(testTerminate, [poac, { from: custodian }])
    })

    it('should NOT reclaim, even if owning tokens', async () => {
      await testWillThrow(testReclaim, [
        poac,
        { from: whitelistedPoaBuyers[0] }
      ])
    })

    it('should NOT payout, even if custodian', async () => {
      await testWillThrow(testPayout, [
        poac,
        fmr,
        { from: custodian, value: 1e18, gasPrice }
      ])
    })

    it('should NOT claim since there are no payouts', async () => {
      await testWillThrow(testClaim, [poac, { from: whitelistedPoaBuyers[0] }])
    })

    it('should NOT updateProofOfCustody, even if valid and from custodian', async () => {
      await testWillThrow(testUpdateProofOfCustody, [
        poac,
        defaultIpfsHash,
        { from: custodian }
      ])
    })

    it('should NOT transfer', async () => {
      await testWillThrow(testTransfer, [
        poac,
        whitelistedPoaBuyers[1],
        1e17,
        {
          from: whitelistedPoaBuyers[0]
        }
      ])
    })

    it('should NOT approve', async () => {
      await testWillThrow(testApprove, [
        poac,
        whitelistedPoaBuyers[1],
        1e17,
        {
          from: whitelistedPoaBuyers[0]
        }
      ])
    })

    it('should NOT transferFrom', async () => {
      // in theory would need approval put here for the sake of demonstrating
      // that approval was attempted as well.
      await testWillThrow(testApprove, [
        poac,
        whitelistedPoaBuyers[1],
        1e17,
        {
          from: whitelistedPoaBuyers[0]
        }
      ])
      await testWillThrow(testTransferFrom, [
        poac,
        whitelistedPoaBuyers[0],
        bbkContributors[0],
        1e17,
        {
          from: whitelistedPoaBuyers[1]
        }
      ])
    })

    // start core stage functionality

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
    })

    it('should start paused', async () => {
      await testPaused(poac, true)
    })

    it('should NOT unpause, even if owner', async () => {
      await testWillThrow(testUnpause, [poac, { from: owner }])
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

    it('should NOT setFailed', async () => {
      await testWillThrow(testSetFailed, [poac, { from: owner }])
    })

    it('should NOT terminate, even if custodian', async () => {
      await testWillThrow(testTerminate, [poac, { from: custodian }])
    })

    it('should NOT reclaim, even if owning tokens', async () => {
      await testWillThrow(testReclaim, [
        poac,
        { from: whitelistedPoaBuyers[0] }
      ])
    })

    it('should NOT payout, even if custodian', async () => {
      await testWillThrow(testPayout, [
        poac,
        fmr,
        { from: custodian, value: 1e18, gasPrice }
      ])
    })

    it('should NOT claim since there are no payouts', async () => {
      await testWillThrow(testClaim, [poac, { from: whitelistedPoaBuyers[0] }])
    })

    it('should NOT updateProofOfCustody, even if valid and from custodian', async () => {
      await testWillThrow(testUpdateProofOfCustody, [
        poac,
        defaultIpfsHash,
        { from: custodian }
      ])
    })

    it('should NOT transfer', async () => {
      await testWillThrow(testTransfer, [
        poac,
        whitelistedPoaBuyers[1],
        1e17,
        {
          from: whitelistedPoaBuyers[0]
        }
      ])
    })

    it('should NOT approve', async () => {
      await testWillThrow(testApprove, [
        poac,
        whitelistedPoaBuyers[1],
        1e17,
        {
          from: whitelistedPoaBuyers[0]
        }
      ])
    })

    it('should NOT transferFrom', async () => {
      // in theory would need approval put here for the sake of demonstrating
      // that approval was attempted as well.
      await testWillThrow(testApprove, [
        poac,
        whitelistedPoaBuyers[1],
        1e17,
        {
          from: whitelistedPoaBuyers[0]
        }
      ])
      await testWillThrow(testTransferFrom, [
        poac,
        whitelistedPoaBuyers[0],
        bbkContributors[0],
        1e17,
        {
          from: whitelistedPoaBuyers[1]
        }
      ])
    })

    // start core stage functionality

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
    let fmr

    before('setup contracts', async () => {
      const contracts = await setupPoaAndEcosystem()
      poac = contracts.poac
      fmr = contracts.fmr

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

      await testBuyTokens(poac, {
        from: whitelistedPoaBuyers[2],
        value: tokenBuyAmount,
        gasPrice
      })

      await fundingTimeoutContract(poac)
    })

    it('should start paused', async () => {
      await testPaused(poac, true)
    })

    it('should NOT unpause, even if owner', async () => {
      await testWillThrow(testUnpause, [poac, { from: owner }])
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

    it('should NOT activate, even if custodian', async () => {
      await testWillThrow(testActivate, [
        poac,
        fmr,
        defaultIpfsHash,
        { from: custodian }
      ])
    })

    it('should NOT terminate, even if custodian', async () => {
      await testWillThrow(testTerminate, [poac, { from: custodian }])
    })

    it('should NOT payout, even if custodian', async () => {
      await testWillThrow(testPayout, [
        poac,
        fmr,
        { from: custodian, value: 1e18, gasPrice }
      ])
    })

    it('should NOT claim since there are no payouts', async () => {
      await testWillThrow(testClaim, [poac, { from: whitelistedPoaBuyers[0] }])
    })

    it('should NOT updateProofOfCustody, even if valid and from custodian', async () => {
      await testWillThrow(testUpdateProofOfCustody, [
        poac,
        defaultIpfsHash,
        { from: custodian }
      ])
    })

    it('should NOT transfer', async () => {
      await testWillThrow(testTransfer, [
        poac,
        whitelistedPoaBuyers[1],
        1e17,
        {
          from: whitelistedPoaBuyers[0]
        }
      ])
    })

    it('should NOT approve', async () => {
      await testWillThrow(testApprove, [
        poac,
        whitelistedPoaBuyers[1],
        1e17,
        {
          from: whitelistedPoaBuyers[0]
        }
      ])
    })

    it('should NOT transferFrom', async () => {
      // in theory would need approval put here for the sake of demonstrating
      // that approval was attempted as well.
      await testWillThrow(testApprove, [
        poac,
        whitelistedPoaBuyers[1],
        1e17,
        {
          from: whitelistedPoaBuyers[0]
        }
      ])
      await testWillThrow(testTransferFrom, [
        poac,
        whitelistedPoaBuyers[0],
        bbkContributors[0],
        1e17,
        {
          from: whitelistedPoaBuyers[1]
        }
      ])
    })

    // start core stage functionality

    it('should setFailed', async () => {
      await testSetFailed(poac)
    })

    it('should NOT setFailed again, even if owner', async () => {
      await testWillThrow(testSetFailed, [poac, { from: owner }])
    })

    it('should reclaim', async () => {
      await testReclaim(poac, { from: whitelistedPoaBuyers[0] })
    })

    it('should reclaim all tokens', async () => {
      await testReclaimAll(poac, whitelistedPoaBuyers)
    })
  })
})

describe('when in Active (stage 4)', () => {
  contract('PoaTokenConcept', () => {
    const newIpfsHash = 'Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u'
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

    // start core stage functionality

    it('should NOT claim if no payouts', async () => {
      await testWillThrow(testClaim, [poac, { from: whitelistedPoaBuyers[0] }])
    })

    it('should payout as custodian', async () => {
      await testPayout(poac, fmr, { value: 2e18, from: custodian, gasPrice })
    })

    it('should NOT payout as custodian if payout is too low', async () => {
      await testWillThrow(testPayout, [
        poac,
        fmr,
        { value: 100, from: custodian, gasPrice }
      ])
    })

    it('should NOT payout as NOT custodian', async () => {
      await testWillThrow(testPayout, [
        poac,
        fmr,
        { value: 2e18, from: owner, gasPrice }
      ])
    })

    it('should claim if payout has been made', async () => {
      await testClaim(poac, { from: whitelistedPoaBuyers[0] })
    })

    it('should update proofOfCustody if custodian', async () => {
      await testUpdateProofOfCustody(poac, newIpfsHash, { from: custodian })
    })

    it('should NOT update proofOfCustody if NOT custodian', async () => {
      await testWillThrow(testUpdateProofOfCustody, [
        poac,
        newIpfsHash,
        { from: owner }
      ])
    })

    it('should NOT update proofOfCustody if NOT valid ipfsHash', async () => {
      // invalid length
      await testWillThrow(testUpdateProofOfCustody, [
        poac,
        newIpfsHash.slice(0, newIpfsHash.length - 2),
        { from: owner }
      ])

      // wrong hashing algo
      await testWillThrow(testUpdateProofOfCustody, [
        poac,
        'Zr' + newIpfsHash.slice(2),
        { from: owner }
      ])
    })

    it('should transfer', async () => {
      await testTransfer(poac, whitelistedPoaBuyers[1], 1e17, {
        from: whitelistedPoaBuyers[0]
      })
    })

    it('should approve', async () => {
      await testApprove(poac, whitelistedPoaBuyers[1], 1e17, {
        from: whitelistedPoaBuyers[0]
      })
    })

    it('should transferFrom', async () => {
      await testTransferFrom(
        poac,
        whitelistedPoaBuyers[0],
        whitelistedPoaBuyers[2],
        1e17,
        {
          from: whitelistedPoaBuyers[1]
        }
      )
    })

    // test for owner done through contract setup test for Terminated stage
    it('should allow terminating if owner or custodian', async () => {
      await testTerminate(poac, { from: custodian })
    })
  })
})

describe('when in Terminated (stage 5)', () => {
  contract('PoaTokenConcept', () => {
    const newIpfsHash = 'Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u'
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

      // move into Terminated
      //⚠️  also acts as a test terminating as owner rather than custodian
      await testTerminate(poac, { from: owner })
    })

    it('should start paused', async () => {
      await testPaused(poac, true)
    })

    it('should NOT unpause, even if owner', async () => {
      await testWillThrow(testUnpause, [poac, { from: owner }])
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

    it('should NOT terminate, even if custodian', async () => {
      await testWillThrow(testTerminate, [poac, { from: custodian }])
    })

    it('should NOT reclaim, even if owning tokens', async () => {
      await testWillThrow(testReclaim, [
        poac,
        { from: whitelistedPoaBuyers[0] }
      ])
    })

    it('should NOT transfer', async () => {
      await testWillThrow(testTransfer, [
        poac,
        whitelistedPoaBuyers[1],
        1e17,
        {
          from: whitelistedPoaBuyers[0]
        }
      ])
    })

    it('should NOT approve', async () => {
      await testWillThrow(testApprove, [
        poac,
        whitelistedPoaBuyers[1],
        1e17,
        {
          from: whitelistedPoaBuyers[0]
        }
      ])
    })

    it('should NOT transferFrom', async () => {
      // in theory would need approval put here for the sake of demonstrating
      // that approval was attempted as well.
      await testWillThrow(testApprove, [
        poac,
        whitelistedPoaBuyers[1],
        1e17,
        {
          from: whitelistedPoaBuyers[0]
        }
      ])
      await testWillThrow(testTransferFrom, [
        poac,
        whitelistedPoaBuyers[0],
        bbkContributors[0],
        1e17,
        {
          from: whitelistedPoaBuyers[1]
        }
      ])
    })
    // start core stage functionality

    it('should NOT claim if no payouts', async () => {
      await testWillThrow(testClaim, [poac, { from: whitelistedPoaBuyers[0] }])
    })

    it('should payout as custodian', async () => {
      await testPayout(poac, fmr, { value: 2e18, from: custodian, gasPrice })
    })

    it('should NOT payout as custodian if payout is too low', async () => {
      await testWillThrow(testPayout, [
        poac,
        fmr,
        { value: 100, from: custodian, gasPrice }
      ])
    })

    it('should NOT payout as NOT custodian', async () => {
      await testWillThrow(testPayout, [
        poac,
        fmr,
        { value: 2e18, from: owner, gasPrice }
      ])
    })

    it('should claim if payout has been made', async () => {
      await testClaim(poac, { from: whitelistedPoaBuyers[0] }, true)
    })

    it('should update proofOfCustody if custodian', async () => {
      await testUpdateProofOfCustody(poac, newIpfsHash, { from: custodian })
    })

    it('should NOT update proofOfCustody if NOT custodian', async () => {
      await testWillThrow(testUpdateProofOfCustody, [
        poac,
        newIpfsHash,
        { from: owner }
      ])
    })

    it('should NOT update proofOfCustody if NOT valid ipfsHash', async () => {
      // invalid length
      await testWillThrow(testUpdateProofOfCustody, [
        poac,
        newIpfsHash.slice(0, newIpfsHash.length - 2),
        { from: owner }
      ])

      // wrong hashing algo
      await testWillThrow(testUpdateProofOfCustody, [
        poac,
        'Zr' + newIpfsHash.slice(2),
        { from: owner }
      ])
    })
  })
})

describe('when handling unhappy paths', async () => {
  contract('PoaTokenConcept', () => {
    let poac

    beforeEach('setup contracts', async () => {
      const contracts = await setupPoaAndEcosystem()
      poac = contracts.poac
    })

    it('should hit checkTimeout when reclaiming after fundingTimeout', async () => {
      const tokenBuyAmount = new BigNumber(1e18)
      const neededTime = await determineNeededTimeTravel(poac)
      await timeTravel(neededTime)
      await testStartSale(poac)

      // purchase tokens to reclaim when failed
      await testBuyTokens(poac, {
        from: whitelistedPoaBuyers[0],
        value: tokenBuyAmount,
        gasPrice
      })

      await fundingTimeoutContract(poac)
      await testFirstReclaim(poac, { from: whitelistedPoaBuyers[0] })
    })

    it('should hit checkTimeout when reclaiming after activationTimeout', async () => {
      const neededTime = await determineNeededTimeTravel(poac)
      await timeTravel(neededTime)
      await testStartSale(poac)

      // move to Pending
      await testBuyRemainingTokens(poac, {
        from: whitelistedPoaBuyers[0],
        gasPrice
      })

      await activationTimeoutContract(poac)

      await testFirstReclaim(poac, { from: whitelistedPoaBuyers[0] }, true)
    })

    it('should setFailed by anyone when activationTimeout has occured', async () => {
      const neededTime = await determineNeededTimeTravel(poac)
      await timeTravel(neededTime)
      await testStartSale(poac)

      // move to Pending
      await testBuyRemainingTokens(poac, {
        from: whitelistedPoaBuyers[0],
        gasPrice
      })

      await activationTimeoutContract(poac)
      await testSetFailed(poac, true)
    })
  })
})

describe('when trying various scenarios involving payout, transfer, approve, and transferFrom', () => {
  contract('PoaTokenConcept', () => {
    let poac
    let fmr
    let feeRate
    let totalSupply
    const defaultPayoutAmount = new BigNumber(0.23437e16)
    const defaultBuyAmount = new BigNumber(1.802384753e16)

    beforeEach('setup contracts', async () => {
      const contracts = await setupPoaAndEcosystem()
      poac = contracts.poac
      fmr = contracts.fmr

      // move into Funding
      const neededTime = await determineNeededTimeTravel(poac)
      await timeTravel(neededTime)
      await testStartSale(poac)

      await testBuyTokensMulti(poac, defaultBuyAmount)

      await testBuyRemainingTokens(poac, {
        from:
          whitelistedPoaBuyers[
            Math.floor(Math.random() * whitelistedPoaBuyers.length)
          ],
        gasPrice
      })

      // move into Active
      await testActivate(poac, fmr, defaultIpfsHash, {
        from: custodian
      })

      // clean out broker balance for easier debugging
      await testBrokerClaim(poac)

      feeRate = await poac.feeRate()
      totalSupply = await poac.totalSupply()
    })

    describe('payout -> trasfer 100% -> payout', () => {
      it('should have correct currentPayout and claims all users', async () => {
        const sender = whitelistedPoaBuyers[0]
        const receiver = whitelistedPoaBuyers[1]
        let senderAccount
        let receiverAccount
        let expectedSenderPayout = new BigNumber(0)
        let expectedReceiverPayout = new BigNumber(0)
        let expectedSenderUnclaimed = new BigNumber(0)
        let expectedReceiverUnclaimed = new BigNumber(0)
        let expectedPerTokenPayout = new BigNumber(0)
        let fee

        await testPayout(poac, fmr, {
          from: custodian,
          value: defaultPayoutAmount,
          gasPrice
        })

        senderAccount = await getAccountInformation(poac, sender)
        receiverAccount = await getAccountInformation(poac, receiver)

        fee = defaultPayoutAmount.mul(feeRate).div(1e3)
        expectedPerTokenPayout = defaultPayoutAmount.sub(fee).div(totalSupply)

        // should just be perToken rate here
        expectedSenderPayout = senderAccount.tokenBalance.mul(
          expectedPerTokenPayout
        )
        expectedReceiverPayout = receiverAccount.tokenBalance.mul(
          expectedPerTokenPayout
        )

        assert(
          areInRange(senderAccount.currentPayout, expectedSenderPayout, 1e2),
          'sender currentPayout should match expectedPayout'
        )
        assert(
          areInRange(
            receiverAccount.currentPayout,
            expectedReceiverPayout,
            1e2
          ),
          'receiver currentPayout should match expectedPayout'
        )

        await testTransfer(poac, receiver, senderAccount.tokenBalance, {
          from: sender
        })

        // now need to account for unclaimedPayouts
        expectedSenderUnclaimed = senderAccount.tokenBalance.mul(
          expectedPerTokenPayout
        )
        expectedReceiverUnclaimed = receiverAccount.tokenBalance.mul(
          expectedPerTokenPayout
        )

        await testPayout(poac, fmr, {
          from: custodian,
          value: defaultPayoutAmount,
          gasPrice
        })

        // another payout has occured we need to account for perToken as well
        senderAccount = await getAccountInformation(poac, sender)
        receiverAccount = await getAccountInformation(poac, receiver)

        fee = defaultPayoutAmount.mul(feeRate).div(1e3)
        expectedPerTokenPayout = defaultPayoutAmount.sub(fee).div(totalSupply)

        expectedSenderPayout = senderAccount.tokenBalance
          .mul(expectedPerTokenPayout)
          .add(expectedSenderUnclaimed)
        expectedReceiverPayout = receiverAccount.tokenBalance
          .mul(expectedPerTokenPayout)
          .add(expectedReceiverUnclaimed)

        assert(
          areInRange(senderAccount.currentPayout, expectedSenderPayout, 1e2),
          'sender currentPayout should match expectedPayout'
        )
        assert(
          areInRange(
            receiverAccount.currentPayout,
            expectedReceiverPayout,
            1e2
          ),
          'receiver currentPayout should match expectedPayout'
        )

        await testClaimAllPayouts(poac, whitelistedPoaBuyers)
      })
    })

    describe('payout -> transfer 50% -> payout', () => {
      it('should have correct currentPayout and claims all users', async () => {
        const sender = whitelistedPoaBuyers[0]
        const receiver = whitelistedPoaBuyers[1]
        let senderAccount
        let receiverAccount
        let expectedSenderPayout = new BigNumber(0)
        let expectedReceiverPayout = new BigNumber(0)
        let expectedSenderUnclaimed = new BigNumber(0)
        let expectedReceiverUnclaimed = new BigNumber(0)
        let expectedPerTokenPayout = new BigNumber(0)
        let fee

        await testPayout(poac, fmr, {
          from: custodian,
          value: defaultPayoutAmount,
          gasPrice
        })

        senderAccount = await getAccountInformation(poac, sender)
        receiverAccount = await getAccountInformation(poac, receiver)

        fee = defaultPayoutAmount.mul(feeRate).div(1e3)
        expectedPerTokenPayout = defaultPayoutAmount.sub(fee).div(totalSupply)

        // should just be perToken rate here
        expectedSenderPayout = senderAccount.tokenBalance.mul(
          expectedPerTokenPayout
        )
        expectedReceiverPayout = receiverAccount.tokenBalance.mul(
          expectedPerTokenPayout
        )

        assert(
          areInRange(senderAccount.currentPayout, expectedSenderPayout, 1e2),
          'sender currentPayout should match expectedPayout'
        )
        assert(
          areInRange(
            receiverAccount.currentPayout,
            expectedReceiverPayout,
            1e2
          ),
          'receiver currentPayout should match expectedPayout'
        )

        await testTransfer(poac, receiver, senderAccount.tokenBalance.div(2), {
          from: sender
        })

        // now need to account for unclaimedPayouts
        expectedSenderUnclaimed = senderAccount.tokenBalance.mul(
          expectedPerTokenPayout
        )
        expectedReceiverUnclaimed = receiverAccount.tokenBalance.mul(
          expectedPerTokenPayout
        )

        await testPayout(poac, fmr, {
          from: custodian,
          value: defaultPayoutAmount,
          gasPrice
        })

        // another payout has occured we need to account for perToken as well
        senderAccount = await getAccountInformation(poac, sender)
        receiverAccount = await getAccountInformation(poac, receiver)

        fee = defaultPayoutAmount.mul(feeRate).div(1e3)
        expectedPerTokenPayout = defaultPayoutAmount.sub(fee).div(totalSupply)

        expectedSenderPayout = senderAccount.tokenBalance
          .mul(expectedPerTokenPayout)
          .add(expectedSenderUnclaimed)
        expectedReceiverPayout = receiverAccount.tokenBalance
          .mul(expectedPerTokenPayout)
          .add(expectedReceiverUnclaimed)

        assert(
          areInRange(senderAccount.currentPayout, expectedSenderPayout, 1e2),
          'sender currentPayout should match expectedPayout'
        )
        assert(
          areInRange(
            receiverAccount.currentPayout,
            expectedReceiverPayout,
            1e2
          ),
          'receiver currentPayout should match expectedPayout'
        )

        await testClaimAllPayouts(poac, whitelistedPoaBuyers)
      })
    })

    describe('payout -> transferFrom 100% -> payout', () => {
      it('should have correct currentPayout and claims all users', async () => {
        const sender = whitelistedPoaBuyers[0]
        const receiver = whitelistedPoaBuyers[1]
        const spender = whitelistedPoaBuyers[2]
        let senderAccount
        let receiverAccount
        let expectedSenderPayout = new BigNumber(0)
        let expectedReceiverPayout = new BigNumber(0)
        let expectedSenderUnclaimed = new BigNumber(0)
        let expectedReceiverUnclaimed = new BigNumber(0)
        let expectedPerTokenPayout = new BigNumber(0)
        let fee

        await testPayout(poac, fmr, {
          from: custodian,
          value: defaultPayoutAmount,
          gasPrice
        })

        senderAccount = await getAccountInformation(poac, sender)
        receiverAccount = await getAccountInformation(poac, receiver)

        fee = defaultPayoutAmount.mul(feeRate).div(1e3)
        expectedPerTokenPayout = defaultPayoutAmount.sub(fee).div(totalSupply)

        // should just be perToken rate here
        expectedSenderPayout = senderAccount.tokenBalance.mul(
          expectedPerTokenPayout
        )
        expectedReceiverPayout = receiverAccount.tokenBalance.mul(
          expectedPerTokenPayout
        )

        assert(
          areInRange(senderAccount.currentPayout, expectedSenderPayout, 1e2),
          `sender currentPayout ${senderAccount.currentPayout.toString()}
          should match expectedPayout ${expectedSenderPayout.toString()}`
        )
        assert(
          areInRange(
            receiverAccount.currentPayout,
            expectedReceiverPayout,
            1e2
          ),
          `receiver currentPayout ${receiverAccount.currentPayout.toString()}
          should match expectedPayout ${expectedReceiverPayout.toString()}`
        )

        await testApprove(poac, spender, senderAccount.tokenBalance, {
          from: sender
        })
        await testTransferFrom(
          poac,
          sender,
          receiver,
          senderAccount.tokenBalance,
          {
            from: spender
          }
        )
        // now need to account for unclaimedPayouts
        expectedSenderUnclaimed = senderAccount.tokenBalance.mul(
          expectedPerTokenPayout
        )
        expectedReceiverUnclaimed = receiverAccount.tokenBalance.mul(
          expectedPerTokenPayout
        )

        await testPayout(poac, fmr, {
          from: custodian,
          value: defaultPayoutAmount,
          gasPrice
        })

        // another payout has occured we need to account for perToken as well
        senderAccount = await getAccountInformation(poac, sender)
        receiverAccount = await getAccountInformation(poac, receiver)

        fee = defaultPayoutAmount.mul(feeRate).div(1e3)
        expectedPerTokenPayout = defaultPayoutAmount.sub(fee).div(totalSupply)

        expectedSenderPayout = senderAccount.tokenBalance
          .mul(expectedPerTokenPayout)
          .add(expectedSenderUnclaimed)
        expectedReceiverPayout = receiverAccount.tokenBalance
          .mul(expectedPerTokenPayout)
          .add(expectedReceiverUnclaimed)

        assert(
          areInRange(senderAccount.currentPayout, expectedSenderPayout, 1e2),
          `sender currentPayout ${senderAccount.currentPayout.toString()}
            should match expectedPayout ${expectedSenderPayout.toString()}`
        )
        assert(
          areInRange(
            receiverAccount.currentPayout,
            expectedReceiverPayout,
            1e2
          ),
          `receiver currentPayout ${receiverAccount.currentPayout.toString()}
            should match expectedPayout ${expectedReceiverPayout.toString()}`
        )

        await testClaimAllPayouts(poac, whitelistedPoaBuyers)
      })
    })

    describe('payout -> trasferFrom 50% -> payout', () => {
      it('should have correct currentPayout and claims all users', async () => {
        const sender = whitelistedPoaBuyers[0]
        const receiver = whitelistedPoaBuyers[1]
        const spender = whitelistedPoaBuyers[2]
        let senderAccount
        let receiverAccount
        let expectedSenderPayout = new BigNumber(0)
        let expectedReceiverPayout = new BigNumber(0)
        let expectedSenderUnclaimed = new BigNumber(0)
        let expectedReceiverUnclaimed = new BigNumber(0)
        let expectedPerTokenPayout = new BigNumber(0)
        let fee

        await testPayout(poac, fmr, {
          from: custodian,
          value: defaultPayoutAmount,
          gasPrice
        })

        senderAccount = await getAccountInformation(poac, sender)
        receiverAccount = await getAccountInformation(poac, receiver)

        fee = defaultPayoutAmount.mul(feeRate).div(1e3)
        expectedPerTokenPayout = defaultPayoutAmount.sub(fee).div(totalSupply)

        // should just be perToken rate here
        expectedSenderPayout = senderAccount.tokenBalance.mul(
          expectedPerTokenPayout
        )
        expectedReceiverPayout = receiverAccount.tokenBalance.mul(
          expectedPerTokenPayout
        )

        assert(
          areInRange(senderAccount.currentPayout, expectedSenderPayout, 1e2),
          `sender currentPayout ${senderAccount.currentPayout.toString()}
          should match expectedPayout ${expectedSenderPayout.toString()}`
        )
        assert(
          areInRange(
            receiverAccount.currentPayout,
            expectedReceiverPayout,
            1e2
          ),
          `receiver currentPayout ${receiverAccount.currentPayout.toString()}
          should match expectedPayout ${expectedReceiverPayout.toString()}`
        )

        await testApprove(poac, spender, senderAccount.tokenBalance, {
          from: sender
        })
        await testTransferFrom(
          poac,
          sender,
          receiver,
          senderAccount.tokenBalance.div(2),
          {
            from: spender
          }
        )

        // now need to account for unclaimedPayouts
        expectedSenderUnclaimed = senderAccount.tokenBalance.mul(
          expectedPerTokenPayout
        )
        expectedReceiverUnclaimed = receiverAccount.tokenBalance.mul(
          expectedPerTokenPayout
        )

        await testPayout(poac, fmr, {
          from: custodian,
          value: defaultPayoutAmount,
          gasPrice
        })

        // another payout has occured we need to account for perToken as well
        senderAccount = await getAccountInformation(poac, sender)
        receiverAccount = await getAccountInformation(poac, receiver)

        fee = defaultPayoutAmount.mul(feeRate).div(1e3)
        expectedPerTokenPayout = defaultPayoutAmount.sub(fee).div(totalSupply)

        expectedSenderPayout = senderAccount.tokenBalance
          .mul(expectedPerTokenPayout)
          .add(expectedSenderUnclaimed)
        expectedReceiverPayout = receiverAccount.tokenBalance
          .mul(expectedPerTokenPayout)
          .add(expectedReceiverUnclaimed)

        assert(
          areInRange(senderAccount.currentPayout, expectedSenderPayout, 1e2),
          `sender currentPayout ${senderAccount.currentPayout.toString()}
            should match expectedPayout ${expectedSenderPayout.toString()}`
        )
        assert(
          areInRange(
            receiverAccount.currentPayout,
            expectedReceiverPayout,
            1e2
          ),
          `receiver currentPayout ${receiverAccount.currentPayout.toString()}
            should match expectedPayout ${expectedReceiverPayout.toString()}`
        )

        await testClaimAllPayouts(poac, whitelistedPoaBuyers)
      })
    })

    describe('transfer 100% -> payout', () => {
      it('should have correct currentPayout and claims all users', async () => {
        const sender = whitelistedPoaBuyers[0]
        const receiver = whitelistedPoaBuyers[1]

        let senderAccount = await getAccountInformation(poac, sender)
        let receiverAccount = await getAccountInformation(poac, receiver)

        await testTransfer(poac, receiver, senderAccount.tokenBalance, {
          from: sender
        })

        await testPayout(poac, fmr, {
          from: custodian,
          value: defaultPayoutAmount,
          gasPrice
        })

        const fee = defaultPayoutAmount.mul(feeRate).div(1e3)
        const expectedPerTokenPayout = defaultPayoutAmount
          .sub(fee)
          .div(totalSupply)

        const expectedSenderPayout = new BigNumber(0)
        const expectedReceiverPayout = receiverAccount.tokenBalance
          .add(senderAccount.tokenBalance)
          .mul(expectedPerTokenPayout)

        senderAccount = await getAccountInformation(poac, sender)
        receiverAccount = await getAccountInformation(poac, receiver)
        assert(
          areInRange(senderAccount.currentPayout, expectedSenderPayout, 1e2),
          `sender currentPayout ${senderAccount.currentPayout.toString()}
          should match expectedPayout ${expectedSenderPayout.toString()}`
        )
        assert(
          areInRange(
            receiverAccount.currentPayout,
            expectedReceiverPayout,
            1e2
          ),
          `receiver currentPayout ${receiverAccount.currentPayout.toString()}
          should match expectedPayout ${expectedReceiverPayout.toString()}`
        )

        await testClaimAllPayouts(poac, whitelistedPoaBuyers)
      })
    })

    describe('transfer 50% -> payout', () => {
      it('should have correct currentPayout and claims all users', async () => {
        const sender = whitelistedPoaBuyers[0]
        const receiver = whitelistedPoaBuyers[1]

        let senderAccount = await getAccountInformation(poac, sender)
        let receiverAccount = await getAccountInformation(poac, receiver)

        await testTransfer(poac, receiver, senderAccount.tokenBalance.div(2), {
          from: sender
        })

        await testPayout(poac, fmr, {
          from: custodian,
          value: defaultPayoutAmount,
          gasPrice
        })

        const fee = defaultPayoutAmount.mul(feeRate).div(1e3)
        const expectedPerTokenPayout = defaultPayoutAmount
          .sub(fee)
          .div(totalSupply)

        const expectedSenderPayout = senderAccount.tokenBalance
          .div(2)
          .mul(expectedPerTokenPayout)
        const expectedReceiverPayout = receiverAccount.tokenBalance
          .add(senderAccount.tokenBalance.div(2))
          .mul(expectedPerTokenPayout)

        senderAccount = await getAccountInformation(poac, sender)
        receiverAccount = await getAccountInformation(poac, receiver)
        assert(
          areInRange(senderAccount.currentPayout, expectedSenderPayout, 1e2),
          `sender currentPayout ${senderAccount.currentPayout.toString()}
          should match expectedPayout ${expectedSenderPayout.toString()}`
        )
        assert(
          areInRange(
            receiverAccount.currentPayout,
            expectedReceiverPayout,
            1e2
          ),
          `receiver currentPayout ${receiverAccount.currentPayout.toString()}
          should match expectedPayout ${expectedReceiverPayout.toString()}`
        )

        await testClaimAllPayouts(poac, whitelistedPoaBuyers)
      })
    })

    describe('transferFrom 100% -> payout', () => {
      it('should have correct currentPayout and claims all users', async () => {
        const sender = whitelistedPoaBuyers[0]
        const receiver = whitelistedPoaBuyers[1]
        const spender = whitelistedPoaBuyers[2]

        let senderAccount = await getAccountInformation(poac, sender)
        let receiverAccount = await getAccountInformation(poac, receiver)

        await testApprove(poac, spender, senderAccount.tokenBalance, {
          from: sender
        })

        await testTransferFrom(
          poac,
          sender,
          receiver,
          senderAccount.tokenBalance,
          {
            from: spender
          }
        )

        await testPayout(poac, fmr, {
          from: custodian,
          value: defaultPayoutAmount,
          gasPrice
        })

        const fee = defaultPayoutAmount.mul(feeRate).div(1e3)
        const expectedPerTokenPayout = defaultPayoutAmount
          .sub(fee)
          .div(totalSupply)

        const expectedSenderPayout = new BigNumber(0)
        const expectedReceiverPayout = receiverAccount.tokenBalance
          .add(senderAccount.tokenBalance)
          .mul(expectedPerTokenPayout)

        senderAccount = await getAccountInformation(poac, sender)
        receiverAccount = await getAccountInformation(poac, receiver)
        assert(
          areInRange(senderAccount.currentPayout, expectedSenderPayout, 1e2),
          `sender currentPayout ${senderAccount.currentPayout.toString()}
          should match expectedPayout ${expectedSenderPayout.toString()}`
        )
        assert(
          areInRange(
            receiverAccount.currentPayout,
            expectedReceiverPayout,
            1e2
          ),
          `receiver currentPayout ${receiverAccount.currentPayout.toString()}
          should match expectedPayout ${expectedReceiverPayout.toString()}`
        )

        await testClaimAllPayouts(poac, whitelistedPoaBuyers)
      })
    })

    describe('transferFrom 50% -> payout', () => {
      it('should have correct currentPayout and claims all users', async () => {
        const sender = whitelistedPoaBuyers[0]
        const receiver = whitelistedPoaBuyers[1]
        const spender = whitelistedPoaBuyers[2]

        let senderAccount = await getAccountInformation(poac, sender)
        let receiverAccount = await getAccountInformation(poac, receiver)

        await testApprove(poac, spender, senderAccount.tokenBalance, {
          from: sender
        })

        await testTransferFrom(
          poac,
          sender,
          receiver,
          senderAccount.tokenBalance.div(2),
          {
            from: spender
          }
        )

        await testPayout(poac, fmr, {
          from: custodian,
          value: defaultPayoutAmount,
          gasPrice
        })

        const fee = defaultPayoutAmount.mul(feeRate).div(1e3)
        const expectedPerTokenPayout = defaultPayoutAmount
          .sub(fee)
          .div(totalSupply)

        const expectedSenderPayout = senderAccount.tokenBalance
          .div(2)
          .mul(expectedPerTokenPayout)
        const expectedReceiverPayout = receiverAccount.tokenBalance
          .add(senderAccount.tokenBalance.div(2))
          .mul(expectedPerTokenPayout)

        senderAccount = await getAccountInformation(poac, sender)
        receiverAccount = await getAccountInformation(poac, receiver)

        assert(
          areInRange(senderAccount.currentPayout, expectedSenderPayout, 1e2),
          `sender currentPayout ${senderAccount.currentPayout.toString()}
          should match expectedPayout ${expectedSenderPayout.toString()}`
        )
        assert(
          areInRange(
            receiverAccount.currentPayout,
            expectedReceiverPayout,
            1e2
          ),
          `receiver currentPayout ${receiverAccount.currentPayout.toString()}
          should match expectedPayout ${expectedReceiverPayout.toString()}`
        )

        await testClaimAllPayouts(poac, whitelistedPoaBuyers)
      })
    })
  })
})

describe('when buying tokens with a fluctuating fiatRate', () => {
  contract('PoaTokenConcept', () => {
    const defaultBuyAmount = new BigNumber(1e18)
    let poac
    let exr
    let exp
    let rate

    beforeEach('setup contracts', async () => {
      const contracts = await setupPoaAndEcosystem()
      poac = contracts.poac
      exr = contracts.exr
      exp = contracts.exp
      rate = new BigNumber(5e4)

      // move into Funding
      const neededTime = await determineNeededTimeTravel(poac)
      await timeTravel(neededTime)
      await testStartSale(poac)

      // set starting rate to be sure of rate
      await testResetCurrencyRate(exr, exp, 'EUR', rate)
    })

    it('should give more tokens when buying and rate is going up', async () => {
      const purchases = []
      // increase by 10 percent
      const increaseRate = 1.1

      for (const from of whitelistedPoaBuyers) {
        const purchase = await testBuyTokens(poac, {
          from,
          value: defaultBuyAmount,
          gasPrice
        })
        purchases.push(purchase)
        rate = rate.mul(increaseRate).floor()
        await testResetCurrencyRate(exr, exp, 'EUR', rate)
      }

      for (let i = 1; i < purchases.length; i++) {
        const previous = purchases[i - 1]
        const current = purchases[i]
        assert(
          previous.lt(current),
          'the previous purchase should be greater than current'
        )
        assert(
          areInRange(previous.mul(increaseRate), current, 1e2),
          'current should be within 2 digits of previous * 1.1'
        )
      }
    })

    it('should give less tokens when buying and rate is going down', async () => {
      const purchases = []
      // increase by 10 percent
      const decreaseRate = 0.1

      for (const from of whitelistedPoaBuyers) {
        const purchase = await testBuyTokens(poac, {
          from,
          value: defaultBuyAmount,
          gasPrice
        })
        purchases.push(purchase)
        rate = rate.sub(rate.mul(decreaseRate)).floor()
        await testResetCurrencyRate(exr, exp, 'EUR', rate)
      }

      for (let i = 1; i < purchases.length; i++) {
        const previous = purchases[i - 1]
        const current = purchases[i]
        assert(
          previous.gt(current),
          'the previous purchase should be less than current'
        )
        assert(
          areInRange(previous.sub(previous.mul(decreaseRate)), current, 1e16),
          'current should be within 2 digits of previous * .1'
        )
      }
    })

    it('should NOT move to pending if rate goes low enough before a buy', async () => {
      const fundingGoalFiatCents = await poac.fundingGoalCents()
      const preNeededWei = await poac.fiatCentsToWei(fundingGoalFiatCents)
      // suddenly eth drops to half of value vs EUR
      rate = rate.div(2).floor()
      await testResetCurrencyRate(exr, exp, 'EUR', rate)

      await testBuyTokens(poac, {
        from: whitelistedPoaBuyers[0],
        value: preNeededWei,
        gasPrice
      })

      const postStage = await poac.stage()
      const postFundedAmountCents = await poac.fundedAmountCents()

      assert.equal(
        postStage.toString(),
        new BigNumber(1).toString(),
        'contract should still be in stage 1, Funding'
      )
      assert(
        areInRange(postFundedAmountCents, fundingGoalFiatCents.div(2), 1e2),
        'fundedAmountCents should be half of fundingGoalFiatCents'
      )
    })

    it('should NOT buy tokens when rate goes high enough before buy', async () => {
      const fundingGoalFiatCents = await poac.fundingGoalCents()
      const preNeededWei = await poac.fiatCentsToWei(fundingGoalFiatCents)

      // buy half of tokens based on original rate
      await testBuyTokens(poac, {
        from: whitelistedPoaBuyers[0],
        value: preNeededWei.div(2),
        gasPrice
      })

      // rate doubles
      rate = rate.mul(2).floor()
      await testResetCurrencyRate(exr, exp, 'EUR', rate)

      const interimStage = await poac.stage()
      const preSecondEthBalance = await getEtherBalance(whitelistedPoaBuyers[1])

      // try to buy after rate doubling (fundingGoal should be met)
      const tx = await poac.buy({
        from: whitelistedPoaBuyers[1],
        value: preNeededWei.div(2).floor(),
        gasPrice
      })
      const { gasUsed } = tx.receipt
      const gasCost = gasPrice.mul(gasUsed)

      const postStage = await poac.stage()
      const postSecondEthBalance = await getEtherBalance(
        whitelistedPoaBuyers[1]
      )
      const postSecondTokenBalance = await poac.balanceOf(
        whitelistedPoaBuyers[1]
      )

      assert.equal(
        interimStage.toString(),
        new BigNumber(1).toString(),
        'stage should still be 1, Funding'
      )
      assert.equal(
        postStage.toString(),
        new BigNumber(2).toString(),
        'stage should now be 2, Pending'
      )
      assert.equal(
        postSecondTokenBalance.toString(),
        new BigNumber(0).toString(),
        'buyer should get no tokens'
      )
      assert.equal(
        preSecondEthBalance.sub(postSecondEthBalance).toString(),
        gasCost.toString(),
        'only gasCost should be deducted, the rest should be sent back'
      )
    })
  })
})
