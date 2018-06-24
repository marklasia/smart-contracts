const IPoaTokenCrowdsale = artifacts.require('IPoaTokenCrowdsale')
const BigNumber = require('bignumber.js')
const {
  owner,
  broker,
  setupPoaProxyAndEcosystem,
  testProxyUnchanged
} = require('../../helpers/poa')
const { addToken } = require('../../helpers/pmr')

describe('when using PoaToken as a master for proxies', () => {
  contract('PoaToken proxy/master', () => {
    let poatm
    let pmr
    let reg

    beforeEach('setup contracts', async () => {
      const contracts = await setupPoaProxyAndEcosystem()
      poatm = contracts.poatm
      pmr = contracts.pmr
      reg = contracts.reg
    })

    it('should not affect proxy storage when master is changed', async () => {
      const newToken = await addToken(pmr, { from: broker })
      // wrap proxy in PoaToken definition
      const poa = await IPoaTokenCrowdsale.at(newToken.tokenAddress)
      // collect data on current proxy state
      const state = await testProxyUnchanged(poa, true, null)
      // need the stub in order to set this up...
      await poatm.setupContract(
        'MASTER',
        'MST',
        'EUR',
        owner,
        owner,
        reg.address,
        new BigNumber(1e18),
        // 100 ish years in the future
        new BigNumber(Date.now()).div(1000).add(60 * 60 * 24 * 30 * 12 * 100),
        // 100 year funding timeout
        new BigNumber(Date.now()).div(1000).add(60 * 60 * 24 * 30 * 12 * 100),
        // 100 year activation timeout
        new BigNumber(Date.now()).div(1000).add(60 * 60 * 24 * 30 * 12 * 100),
        new BigNumber(1)
      )
      // compare previous state to current state
      await testProxyUnchanged(poa, false, state)
    })
  })
})
