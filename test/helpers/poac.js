const PoaTokenConcept = artifacts.require('PoaTokenConcept')
const ContractRegistry = artifacts.require('BrickblockContractRegistry')
const Whitelist = artifacts.require('BrickblockWhitelist')
const AccessToken = artifacts.require('BrickblockAccessToken')
const ExchangeRates = artifacts.require('ExchangeRates')
const ExchangeRateProvider = artifacts.require('ExchangeRateProviderStub')
const FeeManager = artifacts.require('BrickblockFeeManager')

const assert = require('assert')
const { getEtherBalance, getGasUsed, areInRange } = require('./general')
const { finalizedBBK } = require('./bbk')
const { testApproveAndLockMany } = require('./act')
const { testSetCurrencySettings, testFetchRate, testSetRate } = require('./exr')
const BigNumber = require('bignumber.js')

const accounts = web3.eth.accounts
const owner = accounts[0]
const broker = accounts[1]
const custodian = accounts[2]
const bbkBonusAddress = accounts[3]
const bbkContributors = accounts.slice(4, 6)
const whitelistedPoaBuyers = accounts.slice(7, 9)
const bbkTokenDistAmount = new BigNumber(1e18)
const actRate = new BigNumber(1e3)
const defaultName = 'TestPoa'
const defaultSymbol = 'TPA'
const defaultFiatCurrency = 'EUR'
const defaultTimeout = new BigNumber(60 * 60 * 24)
const defaultTotalSupply = new BigNumber('1e20')
const defaultFundingGoal = new BigNumber(5e5)
const defaultFiatRate = new BigNumber(33333)
const getDefaultStartTime = () =>
  new BigNumber(Date.now())
    .div(1000)
    .add(5)
    .floor()

const determineNeededTimeTravel = startTime => {
  const now = new BigNumber(Date.now()).div(1000)
  return now.greaterThan(startTime)
    ? 0
    : startTime
        .sub(now)
        .add(1)
        .floor()
        .toNumber()
}

// sets up all contracts needed in the ecosystem for poa to function
const setupEcosystem = async () => {
  const reg = await ContractRegistry.new()
  const act = await AccessToken.new(reg.address)
  const bbk = await finalizedBBK(
    owner,
    bbkBonusAddress,
    act.address,
    bbkContributors,
    bbkTokenDistAmount
  )
  const exr = await ExchangeRates.new(reg.address)

  if (actRate.greaterThan(0)) {
    await exr.setActRate(actRate)
    const postActRate = await exr.getRateReadable('ACT')

    assert.equal(
      postActRate.toString(),
      actRate.toString(),
      'ACT rate should be set'
    )
  }

  const exp = await ExchangeRateProvider.new(reg.address)
  const fmr = await FeeManager.new(reg.address)
  const wht = await Whitelist.new(reg.address)

  for (const buyer of whitelistedPoaBuyers) {
    const preWhitelisted = await wht.whitelisted(buyer)
    await wht.addAddress(buyer)
    const postWhitelisted = await wht.whitelisted(buyer)

    assert(!preWhitelisted, 'the buyer should start NOT whitelisted')
    assert(postWhitelisted, 'the buyer should be whitelisted')
  }

  await reg.updateContractAddress('BrickblockToken', bbk.address)
  await reg.updateContractAddress('AccessToken', act.address)
  await reg.updateContractAddress('ExchangeRates', exr.address)
  await reg.updateContractAddress('ExchangeRateProvider', exp.address)
  await reg.updateContractAddress('FeeManager', fmr.address)
  await reg.updateContractAddress('Whitelist', wht.address)

  testApproveAndLockMany(bbk, act, bbkContributors, bbkTokenDistAmount)

  return {
    reg,
    act,
    bbk,
    exr,
    exp,
    fmr,
    wht
  }
}

const testSetCurrencyRate = async (exr, exp, currencyType, rate, config) => {
  const callInterval = new BigNumber(30)
  const queryString = 'https://domain.com?currency=ETH'
  const callbackGasLimit = new BigNumber(1.5e5)
  await testSetCurrencySettings(
    exr,
    currencyType,
    callInterval,
    callbackGasLimit,
    queryString,
    {
      from: config.from
    }
  )

  await testFetchRate(exr, exp, currencyType, config)

  await testSetRate(exr, exp, rate, false)
}

const setupPoaAndEcosystem = async startTime => {
  const { reg, act, bbk, exr, exp, fmr, wht } = await setupEcosystem()

  await testSetCurrencyRate(exr, exp, defaultFiatCurrency, defaultFiatRate, {
    from: owner,
    value: 1e18
  })

  const poac = await PoaTokenConcept.new(
    defaultName,
    defaultSymbol,
    defaultFiatCurrency,
    broker,
    custodian,
    reg.address,
    startTime ? startTime : getDefaultStartTime(),
    defaultTimeout,
    defaultTotalSupply,
    defaultFundingGoal
  )

  return {
    reg,
    act,
    bbk,
    exr,
    exp,
    fmr,
    wht,
    poac
  }
}

const testInitialization = async (exr, exp, reg) => {
  await testSetCurrencyRate(exr, exp, defaultFiatCurrency, defaultFiatRate, {
    from: owner,
    value: 1e18
  })

  const defaultStartTime = getDefaultStartTime()

  const poac = await PoaTokenConcept.new(
    defaultName,
    defaultSymbol,
    defaultFiatCurrency,
    broker,
    custodian,
    reg.address,
    defaultStartTime,
    defaultTimeout,
    defaultTotalSupply,
    defaultFundingGoal
  )

  const name = await poac.name()
  const symbol = await poac.symbol()
  const proofOfCustody = await poac.proofOfCustody()
  const fiatCurrency = await poac.fiatCurrency()
  const actualOwner = await poac.owner()
  const actualBroker = await poac.broker()
  const actualCustodian = await poac.custodian()
  const decimals = await poac.decimals()
  const feeRate = await poac.feeRate()
  const creationTime = await poac.creationTime()
  const startTime = await poac.startTime()
  const timeout = await poac.timeout()
  const fundingGoal = await poac.fundingGoal()
  const totalPerTokenPayout = await poac.totalPerTokenPayout()
  const fundedAmount = await poac.fundedAmount()
  const totalSupply = await poac.totalSupply()
  const contractBalance = await poac.balanceOf(poac.address)
  const stage = await poac.stage()
  const paused = await poac.paused()

  assert.equal(name, defaultName, 'name should match that given in constructor')
  assert.equal(
    symbol,
    defaultSymbol,
    'symbol should match that given in constructor'
  )
  assert.equal(proofOfCustody, '', 'proofOfCustody should start uninitialized')
  assert.equal(
    fiatCurrency,
    defaultFiatCurrency,
    'fiatCurrency should match that given in constructor'
  )
  assert.equal(
    owner,
    actualOwner,
    'actualOwner should match that in msg.sender in creating tx'
  )
  assert.equal(
    actualBroker,
    broker,
    'actualBroker should match broker in constructor'
  )
  assert.equal(
    actualCustodian,
    custodian,
    'actualCustodian should match custodian in constructor'
  )
  assert.equal(
    decimals.toString(),
    new BigNumber(18).toString(),
    'decimals should be constant of 18'
  )
  assert.equal(
    feeRate.toString(),
    new BigNumber(5).toString(),
    'fee rate should be a constant of 5'
  )
  assert(
    creationTime.lessThan(new BigNumber(Date.now()).div(1000)) &&
      creationTime.greaterThan(new BigNumber(Date.now()).div(1000).sub(5000)),
    'creationTime no less than 5 seconds before now()'
  )
  assert.equal(
    startTime.toString(),
    defaultStartTime.toString(),
    'startTime should match startTime given in constructor'
  )
  assert.equal(
    timeout.toString(),
    defaultTimeout.toString(),
    'timeout should match that given in constructor'
  )
  assert.equal(
    fundingGoal.toString(),
    defaultFundingGoal.toString(),
    'fundingGoal should match that given in constructor'
  )
  assert.equal(
    totalPerTokenPayout.toString(),
    new BigNumber(0).toString(),
    'totalPerTokenPayout should start uninitialized'
  )
  assert.equal(
    fundedAmount.toString(),
    new BigNumber(0).toString(),
    'fundedAmount should start uninitialized'
  )
  assert.equal(
    totalSupply.toString(),
    defaultTotalSupply.toString(),
    'totalSupply should match that given in constructor'
  )
  assert.equal(
    contractBalance.toString(),
    totalSupply.toString(),
    'contract balance should match totalSupply'
  )
  assert.equal(
    stage.toString(),
    new BigNumber(0).toString(),
    'stage should start at 0 (PreFunding)'
  )
  assert(paused, 'contract should start paused')
}

const testWeiToFiatCents = async (poac, weiInput) => {
  const expectedFiat = weiInput
    .mul(defaultFiatRate)
    .div(1e18)
    .floor()

  const actualFiat = await poac.weiToFiatCents(weiInput)

  assert.equal(
    actualFiat.toString(),
    new BigNumber('3e4'),
    'actualFiat should equal 30000 cents'
  )
  assert.equal(
    expectedFiat.toString(),
    actualFiat.toString(),
    'weiInput converted to actualFiat should match expectedFiat'
  )
}

const testFiatCentsToWei = async (poac, fiatCentInput) => {
  const expectedWei = fiatCentInput
    .mul(1e18)
    .div(defaultFiatRate)
    .floor()

  const actualWei = await poac.fiatCentsToWei(fiatCentInput)

  assert.equal(
    actualWei.toString(),
    new BigNumber('1e18').toString(),
    'actualWei should equal 1e18'
  )
  assert.equal(
    expectedWei.toString(),
    actualWei.toString(),
    'fiatCentInput converted to actualWei should match expectedWei'
  )
}

const testWeiToTokens = async (poac, weiInput) => {
  const expectedTokens = weiInput
    .mul(defaultTotalSupply)
    .div(defaultFundingGoal.mul(1e18).div(defaultFiatRate))
    .floor()

  const actualTokens = await poac.weiToTokens(weiInput)

  assert.equal(
    actualTokens.toString(),
    new BigNumber('6e18').toString(),
    'actualTokens should equal 6e18'
  )
  assert.equal(
    expectedTokens.toString(),
    actualTokens.toString(),
    'weiInput converted to actualTokens should match expectedTokens'
  )
}

const testTokensToWei = async (poac, tokensInput) => {
  const expectedWei = tokensInput
    .mul(defaultFundingGoal.mul(1e18).div(defaultFiatRate))
    .div(defaultTotalSupply)
    .floor()

  const actualWei = await poac.tokensToWei(tokensInput)

  assert.equal(
    expectedWei.toString(),
    actualWei.toString(),
    'tokensInput converted to actualWei should match expectedWei'
  )
}

const testCalculateFee = async (poac, taxableValue) => {
  const feeRate = await poac.feeRate()
  const expectedFee = feeRate
    .mul(taxableValue)
    .div(1e3)
    .floor()

  const actualFee = await poac.calculateFee(taxableValue)

  assert.equal(
    actualFee.toString(),
    new BigNumber('5e15').toString(),
    'actualFee should be 5e15'
  )
  assert.equal(
    expectedFee.toString(),
    actualFee.toString(),
    'actualFee calculated from calculateFee should match expectedFee'
  )
}

const testStartSale = async poac => {
  const preStage = await poac.stage()

  await poac.startSale({ from: owner })

  const postStage = await poac.stage()

  assert.equal(
    preStage.toString(),
    new BigNumber(0).toString(),
    'stage should start as 0, PreFunding'
  )
  assert.equal(
    postStage.toString(),
    new BigNumber(1).toString(),
    'stage should start as 1, Funding'
  )
}

const testBuyTokens = async (poac, config) => {
  assert(!!config.gasPrice, 'gasPrice must be given')
  const buyer = config.from
  const ethBuyAmount = new BigNumber(config.value)
  const fiatBuyAmount = await poac.weiToFiatCents(ethBuyAmount)

  const preEthBalance = await getEtherBalance(buyer)
  const preTokenBalance = await poac.balanceOf(buyer)
  const preFundedAmount = await poac.fundedAmount()

  const tx = await poac.buy(config)
  const gasUsed = await getGasUsed(tx)
  const gasCost = new BigNumber(gasUsed).mul(config.gasPrice)
  const postEthBalance = await getEtherBalance(buyer)
  const postTokenBalance = await poac.balanceOf(buyer)
  const postFundedAmount = await poac.fundedAmount()

  const expectedPostEthBalance = preEthBalance.sub(ethBuyAmount).sub(gasCost)
  const tokenBuyAmount = await poac.weiToTokens(ethBuyAmount)

  assert.equal(
    expectedPostEthBalance.toString(),
    postEthBalance.toString(),
    'postEth balance should match expected value'
  )
  assert.equal(
    postTokenBalance.sub(preTokenBalance).toString(),
    tokenBuyAmount.toString(),
    'buyer token balance should be incremented by tokenBuyAmount'
  )
  assert.equal(
    postFundedAmount.sub(preFundedAmount).toString(),
    fiatBuyAmount.toString(),
    'fiat fundedAmount should be incremented by fiatBuyAmount'
  )
}

const testBuyRemainingTokens = async (poac, config) => {
  assert(!!config.gasPrice, 'gasPrice must be given')
  const fundedAmountCents = await poac.fundedAmount()
  const fundingGoalCents = await poac.fundingGoal()
  const remainingBuyableCents = fundingGoalCents.sub(fundedAmountCents)
  const remainingBuyableEth = await poac.fiatCentsToWei(remainingBuyableCents)
  const updatedConfig = config
  config.value = remainingBuyableEth

  const preStage = await poac.stage()

  const buyer = config.from
  const ethBuyAmount = new BigNumber(config.value)
  const fiatBuyAmount = await poac.weiToFiatCents(ethBuyAmount)

  const preEthBalance = await getEtherBalance(buyer)
  const preTokenBalance = await poac.balanceOf(buyer)
  const preFundedAmount = await poac.fundedAmount()

  const tx = await poac.buy(updatedConfig)
  const gasUsed = await getGasUsed(tx)
  const gasCost = new BigNumber(gasUsed).mul(config.gasPrice)
  const postEthBalance = await getEtherBalance(buyer)
  const postTokenBalance = await poac.balanceOf(buyer)
  const postFundedAmount = await poac.fundedAmount()

  const expectedPostEthBalance = preEthBalance.sub(ethBuyAmount).sub(gasCost)
  const tokenBuyAmount = await poac.weiToTokens(ethBuyAmount)

  assert.equal(
    expectedPostEthBalance.toString(),
    postEthBalance.toString(),
    'postEth balance should match expected value'
  )
  assert(
    // we lose A LOT of precision due to handling fiat...
    areInRange(postTokenBalance, tokenBuyAmount, 1e14),
    'buyer token balance should be incremented by tokenBuyAmount'
  )
  assert.equal(
    postFundedAmount.sub(preFundedAmount).toString(),
    fiatBuyAmount.toString(),
    'fiat fundedAmount should be incremented by fiatBuyAmount'
  )

  const postStage = await poac.stage()

  assert.equal(
    preStage.toString(),
    new BigNumber(1).toString(),
    'stage should be 1, Funding'
  )
  assert.equal(
    postStage.toString(),
    new BigNumber(2).toString(),
    'stage should be 2, Pending'
  )
}

const testActivate = async (poac, fmr, ipfsHash, config) => {
  const contractBalance = await getEtherBalance(poac.address)
  const calculatedFee = await poac.calculateFee(contractBalance)

  const preFeeManagerBalance = await getEtherBalance(fmr.address)
  const preStage = await poac.stage()
  const preCustody = await poac.proofOfCustody()
  const prePaused = await poac.paused()
  const preBrokerPayouts = await poac.currentPayout(broker, true)
  await poac.activate(ipfsHash, config)
  const postFeeManagerBalance = await getEtherBalance(fmr.address)
  const postStage = await poac.stage()
  const postCustody = await poac.proofOfCustody()
  const postPaused = await poac.paused()
  const postBrokerPayouts = await poac.currentPayout(broker, true)

  assert.equal(
    postFeeManagerBalance.sub(preFeeManagerBalance).toString(),
    calculatedFee.toString(),
    'feeManager ether balance should be incremented by paid fee'
  )
  assert.equal(
    preStage.toString(),
    new BigNumber(2),
    'preStage should be 2, Pending'
  )
  assert.equal(
    postStage.toString(),
    new BigNumber(4),
    'postStage should be 4, Active'
  )
  assert.equal(preCustody, '', 'proofOfCustody should start empty')
  assert.equal(
    postCustody,
    ipfsHash,
    'proofOfCustody should be set to ipfsHash'
  )
  assert(prePaused, 'should be paused before activation')
  assert(!postPaused, 'should not be paused after activation')
  assert.equal(
    postBrokerPayouts.sub(preBrokerPayouts).toString(),
    contractBalance.sub(calculatedFee).toString(),
    'contract balance after fee has been paid should be claimable by broker'
  )
}

module.exports = {
  accounts,
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
  testActivate
}
