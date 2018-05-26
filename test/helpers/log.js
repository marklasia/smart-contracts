const ContractRegistry = artifacts.require('BrickblockContractRegistry')
const BrickblockLogger = artifacts.require('BrickblockLogger')
const BigNumber = require('bignumber.js')
const { waitForEvent, gasPrice } = require('./general')
const {
  determineNeededTimeTravel,
  timeTravel,
  testStartSale,
  whitelistedPoaBuyers,
  owner,
  testBuyTokens,
  testBuyRemainingTokens,
  testActivate,
  custodian,
  defaultIpfsHash
} = require('./poa')

// used in order to avoid rewriting a ton of tests...
const getLogger = async poa => {
  const regAddress = await poa.registry()
  const reg = await ContractRegistry.at(regAddress)
  const loggerAddress = await reg.getContractAddress('Logger')
  const log = await BrickblockLogger.at(loggerAddress)
  return log
}

// only meant to be used for transition from stage 0 to stage 1
const testPreFundingToFundingEvent = async (poa, reg, pmr, log) => {
  // change to actual PoaManager contract so that logger validation works...
  await poaManagerToPoaManager(reg, pmr.address)
  const StageEvent = log.StageEvent()

  const neededTime = await determineNeededTimeTravel(
    poa,
    whitelistedPoaBuyers[0]
  )
  await timeTravel(neededTime)
  await testStartSale(poa)

  const { args: triggeredEvent } = await waitForEvent(StageEvent)

  // change back so that other testing functions will work with owner...
  await poaManagerToOwner(reg)

  assert.equal(
    triggeredEvent.tokenAddress,
    poa.address,
    'stage event tokenAddress should match poa.address'
  )
  assert.equal(
    triggeredEvent.stage.toString(),
    new BigNumber(1).toString(),
    'stage event stage should be 1 (Funding)'
  )
}

const testBuyTokensEvents = async (poa, reg, pmr, log) => {
  const from = whitelistedPoaBuyers[0]
  const value = new BigNumber(1e18)

  // change to actual PoaManager contract so that logger validation works...
  await poaManagerToPoaManager(reg, pmr.address)

  const LoggerBuyEvent = log.BuyEvent()
  const BuyEvent = poa.BuyEvent()

  await testBuyTokens(poa, {
    from,
    value,
    gasPrice
  })

  const { args: triggeredLogEvent } = await waitForEvent(LoggerBuyEvent)
  const { args: triggeredEvent } = await waitForEvent(BuyEvent)

  // change back so that other testing functions will work with owner...
  await poaManagerToOwner(reg)

  assert.equal(
    triggeredLogEvent.tokenAddress,
    poa.address,
    'logger buy event tokenAddress should match poa.address'
  )
  assert.equal(
    triggeredLogEvent.buyer,
    from,
    'logger buy event buyer should match from'
  )
  assert.equal(
    triggeredLogEvent.amount.toString(),
    value.toString(),
    'logger buy event amount should match value'
  )
  assert.equal(triggeredEvent.buyer, from, 'buy event buyer should match from')
  assert.equal(
    triggeredEvent.amount.toString(),
    value.toString(),
    'buy event amount should match value'
  )
}

const testBuyRemainingTokensEvents = async (poa, reg, pmr, log) => {
  const from = whitelistedPoaBuyers[1]

  // change to actual PoaManager contract so that logger validation works...
  await poaManagerToPoaManager(reg, pmr.address)

  const LoggerBuyEvent = log.BuyEvent()
  const BuyEvent = poa.BuyEvent()

  const value = await testBuyRemainingTokens(poa, {
    from,
    gasPrice
  })

  const { args: triggeredLogEvent } = await waitForEvent(LoggerBuyEvent)
  const { args: triggeredEvent } = await waitForEvent(BuyEvent)

  // change back so that other testing functions will work with owner...
  await poaManagerToOwner(reg)

  assert.equal(
    triggeredLogEvent.tokenAddress,
    poa.address,
    'logger buy event tokenAddress should match poa.address'
  )
  assert.equal(
    triggeredLogEvent.buyer,
    from,
    'logger buy event buyer should match from'
  )
  assert.equal(
    triggeredLogEvent.amount.toString(),
    value.toString(),
    'logger buy event amount should match value'
  )
  assert.equal(triggeredEvent.buyer, from, 'buy event buyer should match from')
  assert.equal(
    triggeredEvent.amount.toString(),
    value.toString(),
    'buy event amount should match value'
  )
}

const testActivateEvents = async (poa, reg, pmr, fmr, log) => {
  // change to actual PoaManager contract so that logger validation works...
  await poaManagerToPoaManager(reg, pmr.address)

  const LoggerStageEvent = log.StageEvent()
  const StageEvent = poa.StageEvent()
  const LoggerProofOfCustodyUpdatedEvent = log.ProofOfCustodyUpdatedEvent()
  const ProofOfCustodyUpdatedEvent = poa.ProofOfCustodyUpdatedEvent()

  await testActivate(poa, fmr, defaultIpfsHash, {
    from: custodian,
    gasPrice
  })

  const { args: triggeredLoggerStageEvent } = await waitForEvent(
    LoggerStageEvent
  )
  const { args: triggeredStageEvent } = await waitForEvent(StageEvent)

  const { args: triggeredLoggerProofEvent } = await waitForEvent(
    LoggerProofOfCustodyUpdatedEvent
  )
  const { args: triggeredProofEvent } = await waitForEvent(
    ProofOfCustodyUpdatedEvent
  )

  // change back so that other testing functions will work with owner...
  await poaManagerToOwner(reg)

  assert.equal(
    triggeredLoggerStageEvent.tokenAddress,
    poa.address,
    'logger stage event should match poa.address'
  )
  assert.equal(
    triggeredLoggerStageEvent.stage.toString(),
    new BigNumber(4).toString(),
    'stage event should match 3 (Active)'
  )
  assert.equal(
    triggeredStageEvent.stage.toString(),
    new BigNumber(4).toString(),
    'stage event should match 3 (Active)'
  )
  assert.equal(
    triggeredLoggerProofEvent.tokenAddress,
    poa.address,
    'logger proof of custody updated event token address should match poa.address'
  )
  assert.equal(
    triggeredLoggerProofEvent.ipfsHash,
    defaultIpfsHash,
    'logger proof of custody updated even ipfs hash should match defaultIpfsHash'
  )
  assert.equal(
    triggeredProofEvent.ipfsHash,
    defaultIpfsHash,
    'logger proof of custody updated even ipfs hash should match defaultIpfsHash'
  )
}

// changen PoaManager reg entry to owner for easier testing...
const poaManagerToOwner = reg => reg.updateContractAddress('PoaManager', owner)

// change PoaManager reg entry back to correct contract
const poaManagerToPoaManager = (reg, addr) =>
  reg.updateContractAddress('PoaManager', addr)

module.exports = {
  getLogger,
  testPreFundingToFundingEvent,
  poaManagerToOwner,
  poaManagerToPoaManager,
  testBuyTokensEvents,
  testBuyRemainingTokensEvents,
  testActivateEvents
}
