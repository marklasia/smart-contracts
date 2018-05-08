const assert = require('assert')
const BigNumber = require('bignumber.js')
const { setupPoaManager } = require('../helpers/pmr')

describe('when creating a new instance of the contract', () => {
  contract('PoaManager', accounts => {
    let pmr
    const owner = accounts[0]

    before('setup contract state', async () => {
      const contracts = await setupPoaManager()
      pmr = contracts.pmr
    })

    it('should set the owner as msg.sender on creation', async () => {
      assert.equal(
        await pmr.owner(),
        owner,
        'owner will be the address that created the contract'
      )
    })
  })
})

describe('when deploying a poa from poaManager', () => {
  contract('PoaManager', accounts => {
    let pmr
    const broker = accounts[1]
    const custodian = accounts[2]

    before('setup contract state', async () => {
      const contracts = await setupPoaManager()
      pmr = contracts.pmr

      await pmr.addBroker(broker)
    })

    it('should deploy a new poa', async () => {
      await pmr.addToken(
        'test', // name
        'TST', // symbol
        'EUR', // fiat currency
        custodian,
        // 60 seconds from now as unix timestamp
        new BigNumber(Date.now()) // start time
          .div(1000)
          .add(60)
          .floor(),
        // 1 day from now
        60 * 60 * 24, // funding timeout
        // 7 days from fundingTimeout
        60 * 60 * 24 * 7, // activation timeout
        5e5, // fiat goal in cents
        {
          from: broker
        }
      )
    })
  })
})
