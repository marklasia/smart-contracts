const assert = require('assert')
const Proxy = artifacts.require('Proxy')
const PoaToken = artifacts.require('PoaToken')
const { setupPoaAndEcosystem } = require('../helpers/poa')
const {
  checkPreSetupStorage,
  setupContract,
  checkPostSetupStorage,
  enterActiveStage,
  checkPostActiveStorage
} = require('../helpers/pxy')
const { testApprove, whitelistedPoaBuyers } = require('../helpers/poa')

describe('when using Proxy contract to proxy a PoaToken', () => {
  contract('Proxy/PoaToken', () => {
    let poam
    let pmr
    let pxy
    let poa
    let reg
    let fmr

    before('setup contracts', async () => {
      // this sets PoaManager contract as owner in registry... storage will reflect that
      const contracts = await setupPoaAndEcosystem()
      reg = contracts.reg
      pmr = contracts.pmr
      fmr = contracts.fmr
      poam = await PoaToken.new()
      pxy = await Proxy.new(poam.address, reg.address)
      poa = await PoaToken.at(pxy.address)

      assert.equal(
        poa.address,
        pxy.address,
        'poa and pxy should have the same address'
      )
    })

    it('should have no storage sequential storage', async () => {
      await checkPreSetupStorage(poa)
    })

    it('should setupContract', async () => {
      await setupContract(pmr, poa)
    })

    it('should have new storage after setupPoaToken', async () => {
      await checkPostSetupStorage(poa, reg)
    })

    it('should move to active poa stage', async () => {
      await enterActiveStage(poa, fmr)
    })

    it('should approve', async () => {
      await testApprove(poa, whitelistedPoaBuyers[1], 3e18, {
        from: whitelistedPoaBuyers[0]
      })
    })

    it('should have correct storage after entering active', async () => {
      await checkPostActiveStorage(poa, reg)
    })
    /*
      what do we want to do???
      check initial no storage
      check storage after setup
      do move to active
        check storage
        do transfers/approvals
        check storage
      upgrade
        check storage
        do transfers/approvals
        check storage
      bad upgrade
        check storage
        do transfers/approvals ?
        check storage ?
      empty upgrade
        check storage
        do transfers/approvals ?
        check storage ?
    */
  })
})
