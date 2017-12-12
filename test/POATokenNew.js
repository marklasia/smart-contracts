const POAToken = artifacts.require('POAToken')
const BrickblockAccessToken = artifacts.require('BrickblockAccessToken')
const BrickblockUmbrellaStub = artifacts.require('BrickblockUmbrellaStub')
const BrickblockWhitelist = artifacts.require('BrickblockWhitelist')
const WarpTool = artifacts.require('WarpTool')
const BigNumber = require('bignumber.js')

const stages = {
  funding: 0,
  pending: 1,
  failed: 2,
  active: 3,
  terminated: 4
}

function getEtherBalance(address) {
  return new Promise((resolve, reject) => {
    web3.eth.getBalance(address, (err, res) => {
      if (err) reject(err)
      resolve(res)
    })
  })
}

function warpBlocks(blocks) {
  return new Promise((resolve, reject) => {
    contract('WarpTool', async accounts => {
      const warpTool = await WarpTool.new()
      for (let i = 0; i < blocks - 1; i++) {
        await warpTool.warp()
      }
      resolve(true)
    })
  })
}

describe('when using utility functions', () => {
  contract('POAToken', accounts => {
    const ownerAddress = accounts[0]
    const custodianAddress = accounts[2]
    const poaThreshold = new BigNumber(10e18)
    let poa
    before('setup contract', async () => {
      poa = await POAToken.new(
        'TestToken',
        'TST',
        ownerAddress,
        custodianAddress,
        100,
        poaThreshold
      )
    })

    it('should return the right fee based on value given', async () => {
      const inputValue = new BigNumber(50e18)
      const feePercentage = await poa.feePercentage()
      const expectedFee = inputValue.mul(feePercentage).div(1000)
      const actualFee = await poa.calculateFee(inputValue)

      assert.equal(
        expectedFee.toString(),
        actualFee.toString(),
        'the calculated fee should match the contract fee'
      )
    })
  })
})

describe('when in Funding stage', () => {
  contract('POAToken', accounts => {
    const ownerAddress = accounts[0]
    // for now this is the same... need to talk about this
    const brokerAddress = accounts[0]
    const custodianAddress = accounts[1]
    const whitelistedBuyerAddress1 = accounts[2]
    const whitelistedBuyerAddress2 = accounts[3]
    const nonWhitelistedBuyerAddress = accounts[4]
    const investAmount = new BigNumber(1e18)
    const poaThreshold = new BigNumber(2e18)
    let poa
    let wht
    let act
    let umb
    let poaActivateFee

    // TODO: do we really want to differentiate owner and broker? cody does not think so...
    before('setup contracts state', async () => {
      poa = await POAToken.new(
        'TestToken',
        'TST',
        ownerAddress,
        custodianAddress,
        100,
        poaThreshold
      )
      wht = await BrickblockWhitelist.new()
      act = await BrickblockAccessToken.new()
      umb = await BrickblockUmbrellaStub.new()
      await poa.changeWhitelist(wht.address)
      await act.changeUmbrellaAddress(umb.address)
      await umb.changeAccessTokenAddress(act.address)
      await umb.addBroker(brokerAddress)
      await act.mint(brokerAddress, 50e18)
      await act.approve.sendTransaction(poa.address, 50e18, {
        from: brokerAddress
      })
      await wht.addAddress(whitelistedBuyerAddress1)
      poaActivateFee = await poa.calculateFee(poaThreshold)
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
      assert(
        broker === brokerAddress,
        'the broker should be that which was set'
      )
      assert(
        custodian === custodianAddress,
        'the custodian should be that which was set'
      )
      assert(
        timeoutBlock.toNumber() === 100,
        'the timeout should be that which was set'
      )
      assert(
        totalSupply.toNumber() === poaThreshold.toNumber(),
        'the totalSupply should be that which was set'
      )
      assert(
        feePercentage.toNumber() === 5,
        'the owner should be that which was set'
      )
      assert(
        decimals.toNumber() === 18,
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
      const preBuyerTokenBalance = await poa.balanceOf(whitelistedBuyerAddress1)
      const preOwnerTokenBalance = await poa.balanceOf(ownerAddress)
      await poa.buy.sendTransaction({
        from: whitelistedBuyerAddress1,
        value: investAmount
      })
      const postBuyerTokenBalance = await poa.balanceOf(
        whitelistedBuyerAddress1
      )
      const postOwnerTokenBalance = await poa.balanceOf(ownerAddress)
      assert.equal(
        postBuyerTokenBalance.minus(preBuyerTokenBalance).toString(),
        investAmount.toString(),
        'the buyer balance should be incremented by the buy amount'
      )
      assert.equal(
        preOwnerTokenBalance.minus(postOwnerTokenBalance).toString(),
        investAmount.toString(),
        'the owner balance should be decremented by the buy amount'
      )
    })

    it('should NOT buy when NOT whitelisted', async () => {
      try {
        await poa.buy.sendTransaction({
          from: nonWhitelistedBuyerAddress,
          value: investAmount
        })
        assert(false, 'the contract should throw here')
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'the message should contain invalid opcode'
        )
      }
    })

    it('should NOT buy if more than is available', async () => {
      try {
        await poa.buy.sendTransaction({
          from: whitelistedBuyerAddress1,
          value: 50e18
        })
        assert(false, 'the contract should throw here')
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'the error message should contain invalid opcode'
        )
      }
    })

    it('should NOT be able to be activated by custodian', async () => {
      try {
        await poa.activate.sendTransaction({
          from: custodianAddress,
          value: poaActivateFee
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
        await poa.terminate.sendTransaction({
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
        await poa.reclaim.sendTransaction({
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

    it('should NOT allow payouts', async () => {
      try {
        await poa.payout.sendTransaction({
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
        await poa.claim.sendTransaction({
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

    it('should NOT allow transfers', async () => {
      try {
        await poa.transfer.sendTransaction(
          whitelistedBuyerAddress2,
          investAmount,
          {
            from: whitelistedBuyerAddress1
          }
        )
        assert(false, 'the contract should throw here')
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'the error message should contain invalid opcode'
        )
      }
    })

    it('should enter Pending stage once all tokens have been bought', async () => {
      const preBuyerTokenBalance = await poa.balanceOf(whitelistedBuyerAddress1)
      const preOwnerTokenBalance = await poa.balanceOf(ownerAddress)
      await poa.buy.sendTransaction({
        from: whitelistedBuyerAddress1,
        value: investAmount
      })
      const postBuyerTokenBalance = await poa.balanceOf(
        whitelistedBuyerAddress1
      )
      const postOwnerTokenBalance = await poa.balanceOf(ownerAddress)
      assert.equal(
        postBuyerTokenBalance.minus(preBuyerTokenBalance).toString(),
        investAmount.toString(),
        'the buyer balance should be incremented by the buy amount'
      )
      assert.equal(
        preOwnerTokenBalance.minus(postOwnerTokenBalance).toString(),
        investAmount.toString(),
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
  contract('POAToken', accounts => {
    const ownerAddress = accounts[0]
    const brokerAddress = accounts[0]
    const custodianAddress = accounts[1]
    const whitelistedBuyerAddress1 = accounts[2]
    const whitelistedBuyerAddress2 = accounts[3]
    const nonWhitelistedBuyerAddress = accounts[4]
    const investAmount = new BigNumber(1e18)
    const poaThreshold = new BigNumber(10e18)
    let poa
    let poaActivateFee
    let wht
    let umb

    before('setup contract pending state', async () => {
      poa = await POAToken.new(
        'TestToken',
        'TST',
        brokerAddress,
        custodianAddress,
        100,
        poaThreshold
      )
      poaActivateFee = await poa.calculateFee(poaThreshold)
      wht = await BrickblockWhitelist.new()
      act = await BrickblockAccessToken.new()
      umb = await BrickblockUmbrellaStub.new()
      await poa.changeWhitelist(wht.address)
      await poa.changeAccessToken(act.address)
      await act.changeUmbrellaAddress(umb.address)
      await umb.changeAccessTokenAddress(act.address)
      await umb.addFakeToken(poa.address)
      await act.mint(custodianAddress, 50e18)
      await act.approve.sendTransaction(poa.address, 50e18, {
        from: custodianAddress
      })
      await wht.addAddress(whitelistedBuyerAddress1)
      await poa.buy.sendTransaction({
        from: whitelistedBuyerAddress1,
        value: poaThreshold
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
      try {
        await poa.buy.sendTransaction({
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

    it('should NOT enter Active stage if not custodian', async () => {
      try {
        await poa.activate.sendTransaction({
          from: whitelistedBuyerAddress1,
          value: poaActivateFee
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
        await poa.reclaim.sendTransaction({
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

    it('should NOT allow payouts', async () => {
      try {
        await poa.payout.sendTransaction({
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

    it('should NOT allow claiming', async () => {
      try {
        await poa.claim.sendTransaction({
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

    it('should NOT allow transfers', async () => {
      try {
        await poa.transfer.sendTransaction(
          whitelistedBuyerAddress2,
          investAmount,
          {
            from: whitelistedBuyerAddress1
          }
        )
        assert(false, 'the contract should throw here')
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'the error message should contain invalid opcode'
        )
      }
    })

    it('should enter Active stage if sent from custodian and broker has sufficient ACT balance', async () => {
      let diffs = {}
      const preCustodianEtherBalance = await web3.eth.getBalance(
        custodianAddress
      )
      const preAccessTokenEtherBalance = await web3.eth.getBalance(act.address)
      const prePOATokenEtherBalance = await web3.eth.getBalance(poa.address)
      for (let account of accounts) {
        const balance = web3.eth.getBalance(account)
        diffs[account] = balance
      }
      const activation = await poa.activate.sendTransaction({
        from: custodianAddress,
        value: poaActivateFee
      })
      const postCustodianEtherBalance = await web3.eth.getBalance(
        custodianAddress
      )
      const postAccessTokenEtherBalance = await web3.eth.getBalance(act.address)
      const postPOATokenEtherBalance = await web3.eth.getBalance(poa.address)
      const stage = await poa.stage()

      assert.equal(
        stage.toNumber(),
        stages.active,
        'the contract stage should be Active'
      )

      const tx = await web3.eth.getTransaction(activation)
      const minedTx = await web3.eth.getTransactionReceipt(activation)
      const gas = minedTx.gasUsed
      const gasPrice = tx.gasPrice
      const custodianGasCost = gasPrice.mul(gas)
      const expectedCustodianEtherBalance = preCustodianEtherBalance
        .minus(custodianGasCost)
        .minus(poaActivateFee)
        .add(poaThreshold)

      assert.equal(
        postCustodianEtherBalance.toString(),
        expectedCustodianEtherBalance.toString(),
        'the custodian should be charged 1e18 wei'
      )
      assert.equal(
        postAccessTokenEtherBalance
          .minus(preAccessTokenEtherBalance)
          .toString(),
        poaActivateFee.toString(),
        'the access token contract ether balance should be incremented by 1e18'
      )
    })
  })
})

describe('when in Active stage', () => {
  contract('POAToken', accounts => {
    const ownerAddress = accounts[0]
    const brokerAddress = accounts[0]
    const custodianAddress = accounts[1]
    const whitelistedBuyerAddress1 = accounts[2]
    const whitelistedBuyerAddress2 = accounts[3]
    const nonWhitelistedBuyerAddress = accounts[4]
    const investAmount = new BigNumber(1e18)
    const poaThreshold = new BigNumber(2e18)
    const payoutAmount = new BigNumber(1e18)
    let poa
    let poaActivateFee
    let wht
    let umb

    before('setup contracts state', async () => {
      poa = await POAToken.new(
        'TestToken',
        'TST',
        ownerAddress,
        custodianAddress,
        100,
        poaThreshold
      )
      poaActivateFee = await poa.calculateFee(poaThreshold)
      wht = await BrickblockWhitelist.new()
      act = await BrickblockAccessToken.new()
      umb = await BrickblockUmbrellaStub.new()
      await poa.changeWhitelist(wht.address)
      await poa.changeAccessToken(act.address)
      await act.changeUmbrellaAddress(umb.address)
      await umb.changeAccessTokenAddress(act.address)
      await umb.addFakeToken(poa.address)
      await act.mint(custodianAddress, 50e18)
      await act.approve.sendTransaction(poa.address, 50e18, {
        from: custodianAddress
      })
      await wht.addAddress(whitelistedBuyerAddress1)
      await wht.addAddress(whitelistedBuyerAddress2)
      await poa.buy.sendTransaction({
        from: whitelistedBuyerAddress1,
        value: investAmount
      })
      await poa.buy.sendTransaction({
        from: whitelistedBuyerAddress2,
        value: investAmount
      })
      await poa.activate.sendTransaction({
        from: custodianAddress,
        value: poaActivateFee
      })
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
      const expectedFee = poaThreshold.mul(feePercentage).div(1000)
      const calculatedFee = await poa.calculateFee(poaThreshold)
      assert(
        calculatedFee.toNumber(),
        expectedFee.toNumber(),
        'the fees should match'
      )
    })

    // TODO: make payout work with new autobuy
    it('should run payout when custodian', async () => {
      /*
        what is happening here?
        custodianBalance = 100
        calculateFee = .0005 * 5e17
        payout(5e17 + calculateFee)
        custodianBalance = 100 - (5e17 + calculateFee)
      */
      const totalSupply = await poa.totalSupply()
      const fee = await poa.calculateFee(payoutAmount)
      const preTotalPayout = await poa.totalPayout()
      const prePOATokenEtherBalance = await web3.eth.getBalance(poa.address)
      const preCustodianEtherBalance = await web3.eth.getBalance(
        custodianAddress
      )
      const preAccessTokenEtherBalance = await web3.eth.getBalance(act.address)

      const payoutTransaction = await poa.payout.sendTransaction({
        from: custodianAddress,
        value: payoutAmount.add(fee)
      })

      const postTotalPayout = await poa.totalPayout()
      const postPOATokenEtherBalance = await web3.eth.getBalance(poa.address)
      const postCustodianEtherBalance = await web3.eth.getBalance(
        custodianAddress
      )
      await warpBlocks(1)
      const postAccessTokenEtherBalance = await web3.eth.getBalance(act.address)
      const minedTransaction = await web3.eth.getTransactionReceipt(payoutTransaction)
      const transaction = web3.eth.getTransaction(payoutTransaction)
      const gasPrice = await transaction.gasPrice
      const gasUsed = minedTransaction.gasUsed
      const custodianGasCost = gasPrice.mul(gasUsed)
      const expectedCustodianEtherBalance = preCustodianEtherBalance
        .minus(payoutAmount)
        .minus(fee)
        .minus(custodianGasCost)

      const expectedPayout = payoutAmount.mul(1e18).div(totalSupply)

      assert.equal(
        postTotalPayout.minus(preTotalPayout).toString(),
        expectedPayout.toString(),
        'the totalPayout should be incremented by the payoutAmount'
      )
      assert.equal(
        postPOATokenEtherBalance.minus(prePOATokenEtherBalance).toString(),
        payoutAmount.toString(),
        'the ether balance of the POAToken contract should be incremented by the payoutAmount'
      )
      assert.equal(
        expectedCustodianEtherBalance.toString(),
        postCustodianEtherBalance.toString(),
        'the custodianEtherBalance should match the expectedCustodianEtherBalance'
      )
    })

    it('should NOT run payout when NOT custodian', async () => {
      try {
        await poa.payout.sendTransaction({
          from: brokerAddress,
          value: payoutAmount
        })
        assert(false, 'the contract should throw here')
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'the error message should contain invalid opcode'
        )
      }
    })

    it('should allow claiming dividends', async () => {
      const preEtherBalance = await getEtherBalance(whitelistedBuyerAddress1)
      const currentPayout = await poa.currentPayout(whitelistedBuyerAddress1)
      await poa.claim.sendTransaction({
        from: whitelistedBuyerAddress1
      })
      const postEtherBalance = await getEtherBalance(whitelistedBuyerAddress1)
      assert(
        postEtherBalance.minus(preEtherBalance).toString(),
        currentPayout.toString()
      )
    })

    it('should NOT allow claiming the same payout again', async () => {
      try {
        await poa.claim.sendTransaction({
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
        await poa.claim.sendTransaction({
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
  })
})

// TODO: write test for failed!
describe('when a contract does NOT meet its funding goal', () => {
  contract('POAToken', accounts => {
    const ownerAddress = accounts[0]
    let poa

    before('setup contract state', async () => {
      poa = await POAToken.new()
    })

    it('should derp', async () => {
      assert(true)
    })
  })
})

// TODO: write tests for terminated!
describe('when a contract has problems after becoming Active (acts of god etc?)', () => {
  contract('POAToken', accounts => {
    const ownerAddress = accounts[0]
    let poa

    before('setup contract state', async () => {
      poa = await POAToken.new()
    })

    it('should derp', async () => {
      assert(true)
    })
  })
})
