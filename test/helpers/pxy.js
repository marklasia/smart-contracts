const assert = require('assert')
const BigNumber = require('bignumber.js')
const { gasPrice } = require('../helpers/general')
const {
  defaultName32,
  defaultName,
  defaultSymbol32,
  defaultSymbol,
  defaultFiatCurrency32,
  defaultFiatCurrency,
  broker,
  custodian,
  defaultTotalSupply,
  getDefaultStartTime,
  defaultFundingTimeout,
  defaultActivationTimeout,
  defaultFundingGoal,
  owner,
  timeTravel,
  testStartSale,
  determineNeededTimeTravel,
  testBuyRemainingTokens,
  testActivate,
  testBrokerClaim,
  whitelistedPoaBuyers,
  defaultIpfsHashArray32,
  stages
} = require('./poa')
const {
  getAllSimpleStorage,
  shortHexStringStorageToAscii,
  bytes32StorageToAscii,
  findNestedMappingStorage,
  findMappingStorage
} = require('./storage')

const checkPreSetupStorage = async poa => {
  const storage = await getAllSimpleStorage(poa.address)

  for (const item of storage) {
    assert.equal(
      item.data,
      '0x00',
      'all storage at least in range of 0-10 should be 0x00'
    )
  }
}

const getNonSequentialStorage = (contract, identifier) =>
  web3.eth.getStorageAt(contract.address, web3.sha3(identifier))

const getNonSequentialOffsetStorage = (contract, identifier, offset) => {
  const offsetSlot =
    '0x' +
    new BigNumber(web3.sha3(identifier).toString('hex'))
      .add(offset)
      .toString(16)
  return web3.eth.getStorageAt(contract.address, offsetSlot)
}

const getCommonStorage = async poa => ({
  stage: new BigNumber(await getNonSequentialStorage(poa, 'stage')),
  custodian: await getNonSequentialStorage(poa, 'custodian'),
  proofOfCustody32: [
    await getNonSequentialStorage(poa, 'proofOfCustody32'),
    await getNonSequentialOffsetStorage(poa, 'proofOfCustody32', 1)
  ],
  totalSupply: new BigNumber(await getNonSequentialStorage(poa, 'totalSupply')),
  fundedAmountInTokensDuringFiatFunding: new BigNumber(
    await getNonSequentialStorage(poa, 'fundedAmountInTokensDuringFiatFunding')
  ),
  fiatInvestmentPerUserInTokens: new BigNumber(
    await getNonSequentialStorage(poa, 'fiatInvestmentPerUserInTokens')
  ),
  fundedAmountInWei: new BigNumber(
    await getNonSequentialStorage(poa, 'fundedAmountInWei')
  ),
  investmentAmountPerUserInWei: new BigNumber(
    await getNonSequentialStorage(poa, 'investmentAmountPerUserInWei')
  ),
  registry: await getNonSequentialStorage(poa, 'registry'),
  unclaimedPayoutTotals: new BigNumber(
    await getNonSequentialStorage(poa, 'unclaimedPayoutTotals')
  ),
  // truthy 0/1 used for bool
  paused: parseInt(await getNonSequentialStorage(poa, 'paused')),
  tokenInitialized: parseInt(
    await getNonSequentialStorage(poa, 'tokenInitialized')
  ),
  poaCrowdsaleMaster: await getNonSequentialStorage(poa, 'PoaCrowdsaleMaster')
})

const getCrowdsaleStorage = async poa => ({
  crowdsaleInitialized: parseInt(
    await getNonSequentialStorage(poa, 'crowdsaleInitialized')
  ),
  startTime: new BigNumber(await getNonSequentialStorage(poa, 'startTime')),
  fundingTimeout: new BigNumber(
    await getNonSequentialStorage(poa, 'fundingTimeout')
  ),
  activationTimeout: new BigNumber(
    await getNonSequentialStorage(poa, 'activationTimeout')
  ),
  fiatCurrency32: await getNonSequentialStorage(poa, 'fiatCurrency32'),
  fundingGoalInCents: new BigNumber(
    await getNonSequentialStorage(poa, 'fundingGoalInCents')
  ),
  fundedAmountInCentsDuringFiatFunding: new BigNumber(
    await getNonSequentialStorage(poa, 'fundedAmountInCentsDuringFiatFunding')
  ),
  broker: await getNonSequentialStorage(poa, 'broker')
})

const initializeContract = async (poa, reg) => {
  await poa.initializeToken(
    defaultName32,
    defaultSymbol32,
    custodian,
    reg.address,
    defaultTotalSupply
  )

  await poa.initializeCrowdsale(
    defaultFiatCurrency32,
    broker,
    await getDefaultStartTime(),
    defaultFundingTimeout,
    defaultActivationTimeout,
    defaultFundingGoal
  )
}

const checkPostSetupStorage = async (poa, reg) => {
  // get stroage on proxy
  const tokenStorage = await getAllSimpleStorage(poa.address)

  // check PoaToken storage
  const unusedBalances = tokenStorage[0].data
  const unusedTotalSupply = tokenStorage[1].data
  const allowance = tokenStorage[2].data
  const actualOwner = tokenStorage[3].data
  const name = bytes32StorageToAscii(tokenStorage[4].data)
  const symbol = bytes32StorageToAscii(tokenStorage[5].data)

  assert.equal(
    unusedBalances,
    '0x00',
    'slot 0 should be an empty mapping slot for unusedBalances'
  )
  assert.equal(
    unusedTotalSupply,
    '0x00',
    'slot 1 should contain an unused mapping slot for unusedTotalSupply'
  )
  assert.equal(
    allowance,
    '0x00',
    'slot 2 should be an empty slot used for allowance mapping'
  )
  assert.equal(actualOwner, owner, 'slot 3 should contain correct owner value')
  assert.equal(
    name,
    defaultName,
    'slot 4 should contain correct bytes32 representation of name'
  )
  assert.equal(
    symbol,
    defaultSymbol,
    'slot 5 should contain correct bytes32 representation of symbol'
  )

  // check common storage
  const actualCrowdsaleMaster = await reg.getContractAddress(
    'PoaCrowdsaleMaster'
  )
  const {
    stage,
    custodian: actualCustodian,
    proofOfCustody32,
    totalSupply,
    fundedAmountInTokensDuringFiatFunding,
    fundedAmountInWei,
    registry,
    paused,
    tokenInitialized,
    poaCrowdsaleMaster
  } = await getCommonStorage(poa)

  assert.equal(
    stage.toString(),
    stages.PreFunding,
    'stage should be in PreFunding stage'
  )
  assert.equal(
    actualCustodian,
    custodian,
    'custodian should match correct address'
  )
  assert.deepEqual(
    proofOfCustody32,
    ['0x00', '0x00'],
    'proofOfCustody32 should be empty'
  )
  assert.equal(
    totalSupply.toString(),
    defaultTotalSupply.toString(),
    'totalSupply should match defaultTotalSupply'
  )
  assert.equal(
    fundedAmountInTokensDuringFiatFunding.toString(),
    '0',
    'fundedAmountInTokensDuringFiatFunding should be 0'
  )
  assert.equal(
    fundedAmountInWei.toString(),
    '0',
    'fundedAmountInWei should be 0'
  )
  assert.equal(registry, reg.address, 'registry should match reg.address')
  assert(paused, 'paused should be true')
  assert(tokenInitialized, 'tokenInitialized should be true')
  assert.equal(
    poaCrowdsaleMaster,
    actualCrowdsaleMaster,
    'poaCrowdsaleMaster should match actualCrowdsaleMaster'
  )

  // check PoaCrowdsale storage
  const {
    crowdsaleInitialized,
    startTime,
    fundingTimeout,
    activationTimeout,
    fiatCurrency32: actualFiatCurrency32,
    fundingGoalInCents,
    fundedAmountInCentsDuringFiatFunding,
    broker: actualBroker
  } = await getCrowdsaleStorage(poa)

  assert(crowdsaleInitialized, 'crowdsaleInitialized should be true')
  assert(
    startTime.greaterThan(1530280851),
    'startTime should be greater than 06/29/2018'
  )
  assert.equal(
    fundingTimeout.toString(),
    defaultFundingTimeout.toString(),
    'fundingTimeout should match defaultFundingTimeout'
  )
  assert(
    activationTimeout.greaterThan(fundingTimeout),
    'activationTimeout should be greater than fundingTimeout'
  )
  assert.equal(
    bytes32StorageToAscii(actualFiatCurrency32),
    defaultFiatCurrency,
    'actualFiatCurrency32 should conver to match fiatCurrency'
  )
  assert.equal(
    fundingGoalInCents.toString(),
    defaultFundingGoal.toString(),
    'fundingGoalInCents should match defaultFundingGoal'
  )
  assert.equal(
    fundedAmountInCentsDuringFiatFunding.toString(),
    '0',
    'fundedAmountInCentsDuringFiatFunding should be 0'
  )
  assert.equal(actualBroker, broker, 'actualBroker should match broker')
}

const enterActiveStage = async (poa, fmr) => {
  // move into Funding
  const neededTime = await determineNeededTimeTravel(poa)
  await timeTravel(neededTime)
  await testStartSale(poa)

  // move into Pending
  await testBuyRemainingTokens(poa, {
    from: whitelistedPoaBuyers[0],
    gasPrice
  })

  // move into Active
  await testActivate(poa, fmr, defaultIpfsHashArray32, {
    from: custodian
  })

  // clean out broker balance for easier debugging
  await testBrokerClaim(poa)
}

/*
assumes that:
enterActiveStage() has been run to give buy all tokens as whitelistedPoaBuyers[0]
testApprove() has been run to give whitelistedPoaBuyers[1] approval to spend whitelistedPoaBuyers[0]'s tokens
*/
const checkPostActiveStorage = async (poa, reg) => {
  const storage = await getAllSimpleStorage(poa.address)
  const balances = storage[0].data
  const totalSupply = new BigNumber(storage[1].data)
  const allowance = storage[2].data
  // bool paused is no longer packed or visible due to being 0
  const actualOwner = storage[3].data
  const registry = storage[4].data
  const name = shortHexStringStorageToAscii(storage[5].data)
  const symbol = shortHexStringStorageToAscii(storage[6].data)
  // this is an array length value because it is too big to fit into 32 bytes
  // get this by: web3.sha3(arrSlotLoc, { encoding: 'hex' })
  // arrSlotLoc is 0 padded to 64
  const proofOfCustodyLength = storage[7].data
  const fiatCurrency = shortHexStringStorageToAscii(storage[8].data)
  const actualBroker = storage[9].data
  const actualCustodian = storage[10].data
  const startTime = new BigNumber(storage[11].data)
  const fundingTimeout = new BigNumber(storage[12].data)
  const activationTimeout = new BigNumber(storage[13].data)
  const fundingGoalInCents = new BigNumber(storage[14].data)

  const {
    mappingValueStorage: investmentPerUserInWeiHex
  } = await findMappingStorage(poa.address, whitelistedPoaBuyers[0], 0, 20)

  const investmentPerUserInWei = new BigNumber(investmentPerUserInWeiHex)

  const {
    nestedMappingValueStorage: allowanceValueHex
  } = await findNestedMappingStorage(
    poa.address,
    whitelistedPoaBuyers[0],
    whitelistedPoaBuyers[1],
    new BigNumber(0),
    new BigNumber(20)
  )
  const allowanceValue = new BigNumber(allowanceValueHex)

  assert.equal(
    balances,
    '0x00',
    'slot 0 balances should be an empty slot used for mapping locations'
  )
  assert.equal(
    totalSupply.toString(),
    defaultTotalSupply.toString(),
    'slot 1 should contain correct totalSupply'
  )
  assert.equal(
    allowance,
    '0x00',
    'slot 2 allowance should be an empty slot used for mapping location'
  )
  assert.equal(actualOwner, owner, 'slot 3 should contain correct owner value')
  assert.equal(
    registry,
    reg.address,
    'slot 4 should contain correct registry address'
  )
  assert.equal(
    name,
    defaultName32,
    'slot 5 should contain name along with name legnth'
  )
  assert.equal(
    symbol,
    defaultSymbol32,
    'slot 6 should contain symbol along with symbol length'
  )
  assert.equal(
    proofOfCustodyLength,
    '0x5d',
    'slot 7 should contain empty entry for proofOfCustody'
  )
  assert.equal(
    fiatCurrency,
    defaultFiatCurrency32,
    'slot 8 should contain correct fiatRate'
  )
  assert.equal(actualBroker, broker, 'slot 9 should contain correct broker')
  assert.equal(
    actualCustodian,
    custodian,
    'slot 10 should contain correct custodian'
  )
  assert(startTime.gt(0), 'slot 11 startTime should be more than 0')
  assert.equal(
    fundingTimeout.toString(),
    defaultFundingTimeout.toString(),
    'slot 12 should contain correct fundningTimeout'
  )
  assert.equal(
    activationTimeout.toString(),
    defaultActivationTimeout.toString(),
    'slot 13 should contain correct activationTimeout'
  )
  assert.equal(
    fundingGoalInCents.toString(),
    defaultFundingGoal.toString(),
    'slot 14 should contain correct fundingGoalInCents'
  )
  assert.equal(
    allowanceValue.toString(),
    new BigNumber(3e18).toString(),
    'allowance in mapping from slot 2 should match expected value'
  )
  assert.equal(
    investmentPerUserInWei.toString(),
    // calculated based on default values for poa tests
    new BigNumber('15000150001500015000').toString(),
    'investmentPerUserInWei should match expected value'
  )
}

const checkPostIsUpgradedStorage = async (poa, reg) => {
  const storage = await getAllSimpleStorage(poa.address)
  const balances = storage[0].data
  const totalSupply = new BigNumber(storage[1].data)
  const allowance = storage[2].data
  // bool paused is no longer packed or visible due to being 0
  const actualOwner = storage[3].data
  const registry = storage[4].data
  const name = shortHexStringStorageToAscii(storage[5].data)
  const symbol = shortHexStringStorageToAscii(storage[6].data)
  // this is an array length value because it is too big to fit into 32 bytes
  // get this by: web3.sha3(arrSlotLoc, { encoding: 'hex' })
  // arrSlotLoc is 0 padded to 64
  const proofOfCustodyLength = storage[7].data
  const fiatCurrency = shortHexStringStorageToAscii(storage[8].data)
  const actualBroker = storage[9].data
  const actualCustodian = storage[10].data
  const startTime = new BigNumber(storage[11].data)
  const fundingTimeout = new BigNumber(storage[12].data)
  const activationTimeout = new BigNumber(storage[13].data)
  const fundingGoalInCents = new BigNumber(storage[14].data)
  const isUpgraded = new BigNumber(storage[24].data.slice(0, 4))
  const stage = new BigNumber(storage[24].data.slice(4))

  const {
    mappingValueStorage: investmentPerUserInWeiHex
  } = await findMappingStorage(poa.address, whitelistedPoaBuyers[0], 0, 20)

  const investmentPerUserInWei = new BigNumber(investmentPerUserInWeiHex)

  const {
    nestedMappingValueStorage: allowanceValueHex
  } = await findNestedMappingStorage(
    poa.address,
    whitelistedPoaBuyers[0],
    whitelistedPoaBuyers[1],
    new BigNumber(0),
    new BigNumber(20)
  )
  const allowanceValue = new BigNumber(allowanceValueHex)

  assert.equal(
    balances,
    '0x00',
    'slot 0 balances should be an empty slot used for mapping locations'
  )
  assert.equal(
    totalSupply.toString(),
    defaultTotalSupply.toString(),
    'slot 1 should contain correct totalSupply'
  )
  assert.equal(
    allowance,
    '0x00',
    'slot 2 allowance should be an empty slot used for mapping location'
  )
  assert.equal(actualOwner, owner, 'slot 3 should contain correct owner value')
  assert.equal(
    registry,
    reg.address,
    'slot 4 should contain correct registry address'
  )
  assert.equal(
    name,
    defaultName32,
    'slot 5 should contain name along with name legnth'
  )
  assert.equal(
    symbol,
    defaultSymbol32,
    'slot 6 should contain symbol along with symbol length'
  )
  assert.equal(
    proofOfCustodyLength,
    '0x5d',
    'slot 7 should contain empty entry for proofOfCustody'
  )
  assert.equal(
    fiatCurrency,
    defaultFiatCurrency32,
    'slot 8 should contain correct fiatRate'
  )
  assert.equal(actualBroker, broker, 'slot 9 should contain correct broker')
  assert.equal(
    actualCustodian,
    custodian,
    'slot 10 should contain correct custodian'
  )
  assert(startTime.gt(0), 'slot 11 startTime should be more than 0')
  assert.equal(
    fundingTimeout.toString(),
    defaultFundingTimeout.toString(),
    'slot 12 should contain correct fundningTimeout'
  )
  assert.equal(
    activationTimeout.toString(),
    defaultActivationTimeout.toString(),
    'slot 13 should contain correct activationTimeout'
  )
  assert.equal(
    fundingGoalInCents.toString(),
    defaultFundingGoal.toString(),
    'slot 14 should contain correct fundingGoalInCents'
  )
  assert.equal(
    allowanceValue.toString(),
    new BigNumber(3e18).toString(),
    'allowance in mapping from slot 2 should match expected value'
  )
  assert.equal(
    investmentPerUserInWei.toString(),
    // calculated based on default values for poa tests
    new BigNumber('15000150001500015000').toString(),
    'investmentPerUserInWei should match expected value'
  )
  assert(isUpgraded, 'slot 24 shoudl contain isUpgraded as true')
  assert.equal(
    stage.toString(),
    new BigNumber(4).toString(),
    'slot 24 should contain correct stage'
  )
}

module.exports = {
  checkPreSetupStorage,
  initializeContract,
  checkPostSetupStorage,
  enterActiveStage,
  checkPostActiveStorage,
  checkPostIsUpgradedStorage
}
