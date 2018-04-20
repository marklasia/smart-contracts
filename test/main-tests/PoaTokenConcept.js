const PoaTokenConcept = artifacts.require('PoaTokenConcept')
const { setupEcosystem, testSetCurrencyRate } = require('../helpers/poac')
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
      await testSetCurrencyRate(exr, exp, 'EUR', new BigNumber(300), {
        from: owner,
        value: 1e18
      })
      poac = await PoaTokenConcept.new(
        // name
        'TestPoa',
        // symbol
        'TPA',
        // fiatCurrency
        'EUR',
        // broker
        broker,
        // custodian
        custodian,
        // registry
        reg.address,
        // start time
        new BigNumber(Date.now()).div(1000).add(60),
        // timeout
        new BigNumber(60),
        // totalSupply
        new BigNumber(1e20),
        // fundingGoal
        new BigNumber(5e3)
      )
    })
  })
})
