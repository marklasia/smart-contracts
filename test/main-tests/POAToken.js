const PoaToken = artifacts.require('PoaToken')
const BigNumber = require('bignumber.js')
const { getEtherBalance } = require('../helpers/general')
const { stages } = require('../helpers/poa')
const {
  setupRegistry,
  finalizeBbk,
  lockAllBbk,
  testWillThrow
} = require('../helpers/general')

describe('when in Funding stage', () => {
  contract('PoaToken', accounts => {
    const ownerAddress = accounts[0]
    // for now this is the same... need to talk about this
    const brokerAddress = accounts[0]
    const custodianAddress = accounts[1]
    const whitelistedBuyerAddress = accounts[2]
    const nonWhitelistedBuyerAddress = accounts[3]
    const amount = new BigNumber(1e18)
    let poa
    let wht

    // TODO: do we really want to differentiate owner and broker? cody does not think so...
    before('setup contracts state', async () => {
      const { registry, whitelist } = await setupRegistry()
      wht = whitelist
      poa = await PoaToken.new(
        'TestToken',
        'TST',
        ownerAddress,
        custodianAddress,
        registry.address,
        100,
        2e18
      )
      await wht.addAddress(whitelistedBuyerAddress)
    })

    it('should initalize with the right values', async () => {
      const owner = await poa.owner()
      const name = await poa.name()
      const symbol = await poa.symbol()
      const broker = await poa.broker()
      const custodian = await poa.custodian()
      const timeoutBlock = await poa.timeoutBlock()
      const totalSupply = await poa.totalSupply()
      const feePercentage = await poa.feePercentage()
      const decimals = await poa.decimals()
      assert(owner === ownerAddress, 'the owner should be that which was set')
      assert(name === 'TestToken', 'the name should be that which was set')
      assert(symbol === 'TST', 'the symbol should be that which was set')
      assert.equal(
        broker,
        brokerAddress,
        'the broker should be that which was set'
      )
      assert.equal(
        custodian,
        custodianAddress,
        'the custodian should be that which was set'
      )
      assert.equal(
        timeoutBlock.toString(),
        new BigNumber(100).toString(),
        'the timeout should be that which was set'
      )
      assert.equal(
        totalSupply.toString(),
        new BigNumber('2e18').toString(),
        'the totalSupply should be that which was set'
      )
      assert.equal(
        feePercentage.toString(),
        new BigNumber(5).toString(),
        'the owner should be that which was set'
      )
      assert.equal(
        decimals.toString(),
        new BigNumber(18).toString(),
        'the owner should be that which was set'
      )
    })

    it('should start in Funding stage', async () => {
      const stage = await poa.stage()
      assert.equal(
        stage.toNumber(),
        stages.funding,
        'the contract stage should be Active'
      )
    })

    it('should buy when whitelisted', async () => {
      const preBuyerTokenBalance = await poa.balanceOf(whitelistedBuyerAddress)
      const preOwnerTokenBalance = await poa.balanceOf(ownerAddress)
      await poa.buy({
        from: whitelistedBuyerAddress,
        value: amount
      })
      const postBuyerTokenBalance = await poa.balanceOf(whitelistedBuyerAddress)
      const postOwnerTokenBalance = await poa.balanceOf(ownerAddress)
      assert.equal(
        postBuyerTokenBalance.minus(preBuyerTokenBalance).toString(),
        amount.toString(),
        'the buyer balance should be incremented by the buy amount'
      )
      assert.equal(
        preOwnerTokenBalance.minus(postOwnerTokenBalance).toString(),
        amount.toString(),
        'the owner balance should be decremented by the buy amount'
      )
    })

    it('should NOT buy when NOT whitelisted', async () => {
<<<<<<< HEAD
      await testWillThrow(poa.buy, [
        {
=======
      try {
        await poa.buy({
>>>>>>> poa token tests fixed
          from: nonWhitelistedBuyerAddress,
          value: amount
        }
      ])
    })

    it('should NOT buy if more than is available', async () => {
<<<<<<< HEAD
      await testWillThrow(poa.buy, [
        {
=======
      try {
        await poa.buy({
>>>>>>> poa token tests fixed
          from: whitelistedBuyerAddress,
          value: amount.mul(2)
        }
      ])
    })

    it('should NOT be able to be activated by custodian', async () => {
<<<<<<< HEAD
      await testWillThrow(poa.activate, [{ from: custodianAddress }])
    })

    it('should NOT be able to be terminated', async () => {
      await testWillThrow(poa.terminate, [{ from: brokerAddress }])
    })

    it('should NOT allow reclaiming', async () => {
      await testWillThrow(poa.reclaim, [{ from: whitelistedBuyerAddress }])
    })

    it('should NOT allow payouts', async () => {
      await testWillThrow(poa.payout, [{ from: brokerAddress }])
    })

    it('should NOT allow claiming', async () => {
      await testWillThrow(poa.claim, [{ from: whitelistedBuyerAddress }])
=======
      try {
        await poa.activate({
          from: custodianAddress
        })
        assert(false, 'the contract should throw')
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'the error message should contain invalid opcode'
        )
      }
    })

    it('should NOT be able to be terminated', async () => {
      try {
        await poa.terminate({
          from: brokerAddress
        })
        assert(false, 'the contract should throw')
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'the error message should contain invalid opcode'
        )
      }
    })

    it('should NOT allow reclaiming', async () => {
      try {
        await poa.reclaim({
          from: whitelistedBuyerAddress
        })
        assert(false, 'the contract should throw')
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'the error message should contain invalid opcode'
        )
      }
    })

    it('should NOT allow payouts', async () => {
      try {
        await poa.payout({
          from: brokerAddress
        })
        assert(false, 'the contract should throw')
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'the error message should contain invalid opcode'
        )
      }
    })

    it('should NOT allow claiming', async () => {
      try {
        await poa.claim({
          from: whitelistedBuyerAddress
        })
        assert(false, 'the contract should throw')
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'the error message should contain invalid opcode'
        )
      }
>>>>>>> poa token tests fixed
    })

    it('should enter Pending stage once all tokens have been bought', async () => {
      const preBuyerTokenBalance = await poa.balanceOf(whitelistedBuyerAddress)
      const preOwnerTokenBalance = await poa.balanceOf(ownerAddress)
      await poa.buy({
        from: whitelistedBuyerAddress,
        value: amount
      })
      const postBuyerTokenBalance = await poa.balanceOf(whitelistedBuyerAddress)
      const postOwnerTokenBalance = await poa.balanceOf(ownerAddress)
      assert.equal(
        postBuyerTokenBalance.minus(preBuyerTokenBalance).toString(),
        amount.toString(),
        'the buyer balance should be incremented by the buy amount'
      )
      assert.equal(
        preOwnerTokenBalance.minus(postOwnerTokenBalance).toString(),
        amount.toString(),
        'the owner balance should be decremented by the buy amount'
      )
      const stage = await poa.stage()
      assert.equal(
        stage,
        stages.pending,
        'the contract should be in Pending stage'
      )
    })
  })
})

describe('when in Pending stage', () => {
  contract('PoaToken', accounts => {
    const ownerAddress = accounts[0]
    const brokerAddress = accounts[0]
    const custodianAddress = accounts[1]
    const whitelistedBuyerAddress = accounts[2]
    const amount = new BigNumber(1e18)
    let poa
    let wht

    before('setup contract pending state', async () => {
      const { registry, whitelist } = await setupRegistry()
      wht = whitelist
      poa = await PoaToken.new(
        'TestToken',
        'TST',
        ownerAddress,
        custodianAddress,
        registry.address,
        100,
        amount
      )
      await wht.addAddress(whitelistedBuyerAddress)
      await poa.buy({
        from: whitelistedBuyerAddress,
        value: amount
      })
    })

    it('should be in Pending stage', async () => {
      const stage = await poa.stage()
      assert.equal(
        stage.toNumber(),
        stages.pending,
        'the contract stage should be Pending'
      )
    })

    it('should NOT allow buying', async () => {
<<<<<<< HEAD
      await testWillThrow(poa.buy, [{ from: whitelistedBuyerAddress }])
    })

    it('should NOT enter Active stage if not custodian', async () => {
      await testWillThrow(poa.activate, [{ from: whitelistedBuyerAddress }])
    })

    it('should NOT allow reclaiming', async () => {
      await testWillThrow(poa.reclaim, [{ from: whitelistedBuyerAddress }])
    })

    it('should NOT allow payouts', async () => {
      await testWillThrow(poa.payout, [{ from: brokerAddress }])
    })

    it('should NOT allow claiming', async () => {
      await testWillThrow(poa.claim, [{ from: whitelistedBuyerAddress }])
=======
      try {
        await poa.buy({
          from: whitelistedBuyerAddress
        })
        assert(false, 'the contract should throw')
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'the error message should contain invalid opcode'
        )
      }
    })

    it('should NOT enter Active stage if not custodian', async () => {
      try {
        await poa.activate({
          from: whitelistedBuyerAddress
        })
        assert(false, 'the contract should throw')
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'the error message should contain invalid opcode'
        )
      }
    })

    it('should NOT allow reclaiming', async () => {
      try {
        await poa.reclaim({
          from: whitelistedBuyerAddress
        })
        assert(false, 'the contract should throw')
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'the error message should contain invalid opcode'
        )
      }
    })

    it('should NOT allow payouts', async () => {
      try {
        await poa.payout({
          from: brokerAddress
        })
        assert(false, 'the contract should throw')
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'the error message should contain invalid opcode'
        )
      }
    })

    it('should NOT allow claiming', async () => {
      try {
        await poa.claim({
          from: whitelistedBuyerAddress
        })
        assert(false, 'the contract should throw')
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'the error message should contain invalid opcode'
        )
      }
>>>>>>> poa token tests fixed
    })

    it('should enter Active stage if custodian', async () => {
      await poa.activate({
        from: custodianAddress
      })
      const stage = await poa.stage()
      assert.equal(
        stage.toNumber(),
        stages.active,
        'the contract stage should be Active'
      )
    })
  })
})

describe('when in Active stage', () => {
  contract('PoaToken', accounts => {
    const ownerAddress = accounts[0]
    const brokerAddress = accounts[0]
    const custodianAddress = accounts[1]
    const whitelistedBuyerAddress1 = accounts[2]
    const whitelistedBuyerAddress2 = accounts[3]
    const amount = new BigNumber(1e18)
    let poa
    let wht

    before('setup contracts state', async () => {
      const { registry, whitelist } = await setupRegistry()
      const reg = registry
      wht = whitelist
      poa = await PoaToken.new(
        'TestToken',
        'TST',
        ownerAddress,
        custodianAddress,
        reg.address,
        100,
        amount
      )
      await wht.addAddress(whitelistedBuyerAddress1)
      await wht.addAddress(whitelistedBuyerAddress2)
      await poa.buy({
        from: whitelistedBuyerAddress1,
        value: amount.div(2)
      })
      await poa.buy({
        from: whitelistedBuyerAddress2,
        value: amount.div(2)
      })
      await poa.activate({
        from: custodianAddress
      })
      await finalizeBbk(reg)
      await lockAllBbk(reg)
    })

    it('should be in Active stage', async () => {
      const stage = await poa.stage()
      assert.equal(
        stage.toNumber(),
        stages.active,
        'the contract stage should be Active'
      )
    })

    it('should calculate fees', async () => {
      const feePercentage = await poa.feePercentage()
      const expectedFee = amount.mul(feePercentage).div(100)
      const calculatedFee = await poa.calculateFee(amount)
      assert(
        calculatedFee.toNumber(),
        expectedFee.toNumber(),
        'the fees should match'
      )
    })

    it('should run payout when broker', async () => {
      const preTotalPayout = await poa.totalPayout()
      const preBrokerEtherBalance = await getEtherBalance(brokerAddress)
      const fee = await poa.calculateFee(amount)
      await poa.payout({
        from: brokerAddress,
        value: amount
      })
      const postTotalPayout = await poa.totalPayout()
      const postBrokerEtherBalance = await getEtherBalance(brokerAddress)
      assert(
        postTotalPayout.minus(preTotalPayout).toString(),
        amount.toString(),
        'totalPayout should be incremented by the ether value of the transaction'
      )
      assert(
        preBrokerEtherBalance.minus(postBrokerEtherBalance).toString(),
        fee.toString(),
        'the broker ether balance should be decremented by the fee value'
      )
    })

    it('should NOT run payout when NOT broker', async () => {
<<<<<<< HEAD
      await testWillThrow(poa.payout, [
        { from: custodianAddress, value: amount }
      ])
=======
      try {
        await poa.payout({
          from: custodianAddress,
          value: amount
        })
        assert(false, 'the contract should throw here')
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'the error message should contain invalid opcode'
        )
      }
>>>>>>> poa token tests fixed
    })

    it('should allow claiming dividends', async () => {
      const preEtherBalance = await getEtherBalance(whitelistedBuyerAddress1)
      const currentPayout = await poa.currentPayout(whitelistedBuyerAddress1)
      await poa.claim({
        from: whitelistedBuyerAddress1
      })
      const postEtherBalance = await getEtherBalance(whitelistedBuyerAddress1)
      assert(
        postEtherBalance.minus(preEtherBalance).toString(),
        currentPayout.toString()
      )
    })

    it('should NOT allow claiming the same payout again', async () => {
<<<<<<< HEAD
      await testWillThrow(poa.claim, [{ from: whitelistedBuyerAddress1 }])
    })

    it('should NOT allow claiming from a non-investor', async () => {
      await testWillThrow(poa.claim, [{ from: brokerAddress }])
=======
      try {
        await poa.claim({
          from: whitelistedBuyerAddress1
        })
        assert(false, 'the contract should throw')
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'the error message should contain invalid opcode'
        )
      }
    })

    it('should NOT allow claiming from a non-investor', async () => {
      try {
        await poa.claim({
          from: brokerAddress
        })
        assert(false, 'the contract should throw')
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'the error message should contain invalid opcode'
        )
      }
>>>>>>> poa token tests fixed
    })
  })
})
