const {
  testPreFundingToFundingEvent,
  testBuyTokensEvents,
  testBuyRemainingTokensEvents,
  testActivateEvents
} = require('../helpers/log')
const { setupPoaProxyAndEcosystem } = require('../helpers/poa')

describe('when using Brickblock logger to log PoaToken events', () => {
  contract('BrickblockLogger/PoaToken', () => {
    let poa
    let log
    let pmr
    let reg
    let fmr
    before('setup contracts', async () => {
      const contracts = await setupPoaProxyAndEcosystem()
      poa = contracts.poa
      log = contracts.log
      pmr = contracts.pmr
      reg = contracts.reg
      fmr = contracts.fmr
    })

    it('should log stage events', async () => {
      await testPreFundingToFundingEvent(poa, reg, pmr, log)
    })

    it('should log buy events', async () => {
      await testBuyTokensEvents(poa, reg, pmr, log)
      await testBuyRemainingTokensEvents(poa, reg, pmr, log)
    })

    it('should log proof of custody updated event', async () => {
      await testActivateEvents(poa, reg, pmr, fmr, log)
    })

    it('should log payout events', async () => {})

    it('should log claim events', async () => {})

    it('should log terminated events', async () => {})

    it('should log reclaim event', async () => {})

    it('should log custodian changed event', async () => {})
  })
})

/*
need to test following events:
  StageEvent
  BuyEvent
  PayoutEvent
  ClaimEvent
  TerminatedEvent
  ProofOfCustodyUpdatedEvent
  ReclaimEvent
  CustodianChangedEvent
*/
