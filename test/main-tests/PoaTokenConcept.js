const PoaTokenConcept = artifacts.require('PoaTokenConcept')
const { setupEcosystem, testSetCurrencyRate } = require('../helpers/poac')
const { testWillThrow, addressZero } = require('../helpers/general.js')
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
const defaultFiatRate = new BigNumber(3e4)
const defaultStartTime = new BigNumber(Date.now())
  .div(1000)
  .add(60)
  .floor()

describe('when initializing PoaTokenConcept', () => {
  contract('PoaTokenConcept', () => {
    let poac
    let reg
    let exr
    let exp

    beforeEach('setup contracts', async () => {
      const contracts = await setupEcosystem(
        owner,
        broker,
        custodian,
        bbkBonusAddress,
        bbkContributors,
        whitelistedPoaBuyers,
        bbkTokenDistAmount,
        actRate
      )

      reg = contracts.reg
      exr = contracts.exr
      exp = contracts.exp
    })

    it('should start with the right values', async () => {
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

      poac = await PoaTokenConcept.new(
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

      assert.equal(
        name,
        defaultName,
        'name should match that given in constructor'
      )
      assert.equal(
        symbol,
        defaultSymbol,
        'symbol should match that given in constructor'
      )
      assert.equal(
        proofOfCustody,
        '',
        'proofOfCustody should start uninitialized'
      )
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
          creationTime.greaterThan(
            new BigNumber(Date.now()).div(1000).sub(5000)
          ),
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
    })

    it('should NOT initialize with a NON ready fiatRate', async () => {
      await testWillThrow(PoaTokenConcept.new, [
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
        defaultStartTime,
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
        defaultStartTime,
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
        defaultStartTime,
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
        defaultStartTime,
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
        defaultStartTime,
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
        defaultStartTime,
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
        defaultStartTime,
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
        defaultStartTime,
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
        defaultStartTime,
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
        defaultStartTime,
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
        defaultStartTime,
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
        defaultStartTime,
        defaultTimeout,
        defaultTotalSupply,
        0
      ])
    })
  })
})

describe.only('when testing utility functions', () => {
  contract('PoaTokenConcept', () => {
    let reg
    let exr
    let exp
    let poac

    before('setup contracts', async () => {
      const contracts = await setupEcosystem(
        owner,
        broker,
        custodian,
        bbkBonusAddress,
        bbkContributors,
        whitelistedPoaBuyers,
        bbkTokenDistAmount,
        actRate
      )

      reg = contracts.reg
      exr = contracts.exr
      exp = contracts.exp

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

      poac = await PoaTokenConcept.new(
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
    })

    it('should use weiToFiatCents to return correct value', async () => {
      const weiInput = new BigNumber('1e18')
      const expectedFiat = weiInput
        .mul(defaultFiatRate)
        .div(1e18)
        .floor()

      const actualFiat = await await poac.weiToFiatCents(weiInput)

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
    })

    it('should use fiatCentsToWei to return correct value', async () => {
      const fiatCentInput = new BigNumber('3e4')
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
    })

    it('should use weiToTokens to calculate correct value', async () => {
      const weiInput = new BigNumber('1e18')
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
    })

    it('should use tokensToWei to calculate correct value', async () => {
      const tokensInput = new BigNumber('1e18')
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
    })
  })
})
