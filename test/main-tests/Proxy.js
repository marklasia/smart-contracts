const assert = require('assert')
const Proxy = artifacts.require('Proxy')
const PoaToken = artifacts.require('PoaToken')
const {
  setupPoaAndEcosystem,
  defaultName,
  defaultSymbol,
  defaultFiatCurrency,
  broker,
  custodian,
  defaultTotalSupply,
  getDefaultStartTime,
  defaultFundingTimeout,
  defaultActivationTimeout,
  defaultFundingGoal
} = require('../helpers/poa')
const { getAllSimpleStorage } = require('../helpers/storage')

describe('when using Proxy contract to proxy a PoaToken', () => {
  contract('Proxy/PoaToken', () => {
    let poam
    let pmr
    let pxy
    let poa
    let reg

    before('setup contracts', async () => {
      const contracts = await setupPoaAndEcosystem()
      reg = contracts.reg
      pmr = contracts.pmr
      poam = await PoaToken.new()
      pxy = await Proxy.new(poam.address, reg.address)
      poa = await PoaToken.at(pxy.address)

      assert.equal(
        poa.address,
        pxy.address,
        'poa and pxy should have the same address'
      )
    })

    it('should have no storage in first 10 slots', async () => {
      const storage = await getAllSimpleStorage(poa.address)

      for (const item of storage) {
        assert.equal(
          item.data,
          '0x00',
          'all storage at least in range of 0-10 should be 0x00'
        )
      }
    })

    it('should setupContract', async () => {
      await pmr.setupPoaToken(
        poa.address,
        defaultName,
        defaultSymbol,
        defaultFiatCurrency,
        broker,
        custodian,
        defaultTotalSupply,
        await getDefaultStartTime(),
        defaultFundingTimeout,
        defaultActivationTimeout,
        defaultFundingGoal
      )
    })

    it('should have new storage after setupPoaToken', async () => {
      const storage = await getAllSimpleStorage(poa.address)
      console.log(storage)
    })
  })
})
