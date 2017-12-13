const BrickblockAccessToken = artifacts.require('BrickblockAccessToken.sol')
const BrickblockFountain = artifacts.require('BrickblockFountain.sol')
const BrickblockUmbrella = artifacts.require('BrickblockUmbrella.sol')
const BrickblockFountainStub = artifacts.require('BrickblockFountainStub.sol')
const BrickblockUmbrellaStub = artifacts.require('BrickblockUmbrellaStub.sol')
const POATokenStub = artifacts.require('POATokenStub.sol')
const BigNumber = require('bignumber.js')

// function generateAddresses(number) {
//   accounts = []
//   for(let i = 0; i < number; i++) {
//     const account = web3.eth.accounts.create()
//     accounts.push(account)
//   }
//   let addresses = accounts.map(account => {
//     return account.address
//   })
//   return addresses
// }

describe('after the contract is created', () => {
  contract('BrickblockAccessToken', accounts => {
    let act
    const owner = accounts[0]

    before('setup BrickblockAccessToken', async () => {
      act = await BrickblockAccessToken.deployed()
    })

    it('should set the owner as msg.sender on creation', async () => {
      const newOwner = await act.owner()
      assert.equal(newOwner, owner)
    })

    it('should start with a total supply of 0', async () => {
      const totalSupply = await act.totalSupply()
      assert.equal(totalSupply.toNumber(), 0, 'the total supply should be 0')
    })

    it('should have 18 decimals set', async () => {
      const decimals = await act.decimals()
      assert.equal(decimals.toNumber(), 18, 'the decimals should be 18')
    })
  })
})

describe('when changing the fountain address', () => {
  contract('BrickblockAccessToken', accounts => {
    let act
    const owner = accounts[0]
    let fountain
    let altFountain

    before('setup BrickblockAccessToken', async () => {
      act = await BrickblockAccessToken.deployed()
      fountain = await BrickblockFountain.deployed()
      altFountain = await BrickblockFountainStub.new()
    })

    it('should start with the accompanied migration address of fountain', async () => {
      const savedFountain = await act.fountainAddress()
      assert.equal(
        savedFountain,
        fountain.address,
        'the fountain should be set to the deployed fountain by migrations'
      )
    })

    it('should NOT set the fountain if the address is the same', async () => {
      try {
        await act.changeFountainAddress(fountain.address)
        assert(
          false,
          'the contract should throw when changing fountain when NOT owner'
        )
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'message should contain invalid opcode'
        )
      }
    })

    it('should NOT set the fountain when NOT owner', async () => {
      try {
        await act.changeFountainAddress.sendTransaction(altFountain.address, {
          from: accounts[1]
        })
        assert(
          false,
          'the contract should throw when changing fountain when NOT owner'
        )
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'message should contain invalid opcode'
        )
      }
    })

    it('should NOT set the fountain when NOT a contract', async () => {
      try {
        await act.changeFountainAddress(accounts[2])
        assert(
          false,
          'the contract should throw when changing fountain when NOT a contract'
        )
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'message should contain invalid opcode'
        )
      }
    })

    it('should NOT set the fountain when address is the same as self', async () => {
      try {
        await act.changeFountainAddress(act.address)
        assert(
          false,
          'the contract should throw when changing fountain to address same as self'
        )
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'message should contain invalid opcode'
        )
      }
    })

    it('should NOT set the fountain when address is the same as owner', async () => {
      try {
        await act.changeFountainAddress(owner)
        assert(
          false,
          'the contract should throw when changing fountain to address same as owner'
        )
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'message should contain invalid opcode'
        )
      }
    })

    it('should set the fountain when owner, fountainAddress is contract, is NOT same as this, and is NOT set to the address of the owner', async () => {
      const preFountain = await act.fountainAddress()
      assert.equal(
        preFountain,
        fountain.address,
        'the fountain should the address set in initial migrations'
      )
      await act.changeFountainAddress(altFountain.address)
      const postFountain = await act.fountainAddress()
      assert.equal(
        postFountain,
        altFountain.address,
        'the fountain addresses does NOT match that just sent'
      )
    })
  })
})

describe('when minting', () => {
  contract('BrickblockAccessToken', accounts => {
    let act
    const owner = accounts[0]
    let fountain
    let recipient = accounts[1]
    const amount = new BigNumber(1e24)

    before('setup BrickblockAccessToken', async () => {
      act = await BrickblockAccessToken.deployed()
      fountain = await BrickblockFountainStub.new()
      await act.changeFountainAddress(fountain.address)
      await fountain.changeAccessTokenAddress(act.address)
    })

    it('should mint when owner', async () => {
      const preBalance = await act.balanceOf(recipient)
      await act.mint(recipient, amount)
      const postBalance = await act.balanceOf(recipient)
      assert.equal(
        postBalance.minus(preBalance).toString(),
        amount.toString(),
        'the balance should be incremented by amount'
      )
    })

    it('should mint when fountain', async () => {
      const preBalance = await act.balanceOf(recipient)
      await fountain.simulateFountainMint(recipient, amount)
      const postBalance = await act.balanceOf(recipient)
      assert.equal(
        postBalance.minus(preBalance).toString(),
        amount.toString(),
        'the balance should be incremented by amount'
      )
    })

    it('should NOT mint when not fountain or owner', async () => {
      try {
        await act.mint.sendTransaction(accounts[3], amount, {
          from: accounts[3]
        })
        assert(
          false,
          'the contract should throw when trying to mint from NOT owner or fountain'
        )
      } catch (error) {
        assert(
          /invalid opcode/.test(error),
          'invalid opcode should be in the error'
        )
      }
    })
  })
})

describe('when burning', () => {
  contract('BrickblockAccessToken', accounts => {
    const owner = accounts[0]
    const activeBroker = accounts[1]
    const inactiveBroker = accounts[2]
    const brokeBroker = accounts[3]
    const zeroApprovalBroker = accounts[4]
    const amount = new BigNumber(1e24)
    const burnAmount = amount.div(5)
    let activePOAToken;
    let inactivePOAToken;
    let act
    let umbrellaStub

    before('setup BrickblockAccessToken and related contracts state', async () => {
      act = await BrickblockAccessToken.deployed()
      umbrellaStub = await BrickblockUmbrellaStub.new()
      activePOAToken = await POATokenStub.new()
      inactivePOAToken = await POATokenStub.new()
      await activePOAToken.changeAccessTokenAddress(act.address)
      await inactivePOAToken.changeAccessTokenAddress(act.address)
      await act.changeUmbrellaAddress(umbrellaStub.address)
      await umbrellaStub.changeAccessTokenAddress(act.address)
      await act.mint(activeBroker, amount)
      await act.mint(inactiveBroker, amount)
      await umbrellaStub.addBroker(activeBroker)
      await umbrellaStub.addBroker(inactiveBroker)
      await umbrellaStub.addBroker(brokeBroker)
      await umbrellaStub.addBroker(zeroApprovalBroker)
      await umbrellaStub.deactivateBroker(inactiveBroker)
      await umbrellaStub.addFakeToken(activePOAToken.address)
      await umbrellaStub.addFakeToken(inactivePOAToken.address)
      await umbrellaStub.deactivateToken(inactivePOAToken.address)
      await act.approve.sendTransaction(umbrellaStub.address, amount, {
        from: activeBroker
      })
      await act.approve.sendTransaction(umbrellaStub.address, amount, {
        from: inactiveBroker
      })
      await act.approve.sendTransaction(umbrellaStub.address, amount, {
        from: brokeBroker
      })
      await act.approve.sendTransaction(activePOAToken.address, amount, {
        from: activeBroker
      })
      await act.approve.sendTransaction(activePOAToken.address, amount, {
        from: inactiveBroker
      })
      await act.approve.sendTransaction(activePOAToken.address, amount, {
        from: brokeBroker
      })
      await act.approve.sendTransaction(inactivePOAToken.address, amount, {
        from: activeBroker
      })
      await act.approve.sendTransaction(inactivePOAToken.address, amount, {
        from: inactiveBroker
      })
      await act.approve.sendTransaction(inactivePOAToken.address, amount, {
        from: brokeBroker
      })
    })

    it('should should burn when sent from umbrella contract', async () => {
      const preTotalSupply = await act.totalSupply()
      const preActiveBrokerBalance = await act.balanceOf(activeBroker)
      await umbrellaStub.simulateBurnFrom(burnAmount, activeBroker)
      const postActiveBrokerBalance = await act.balanceOf(activeBroker)
      const postTotalSupply = await act.totalSupply()
      assert.equal(preTotalSupply.minus(postTotalSupply).toString(), burnAmount.toString(), 'the total supply should be decremented by the total amount')
      assert.equal(preActiveBrokerBalance.minus(postActiveBrokerBalance).toString(), burnAmount.toString(), 'the activeBroker balance should be decremented by the burnAmount')
    })

    it('should burn when from activePOAToken contract', async () => {
      const preTotalSupply = await act.totalSupply()
      const preActiveBrokerBalance = await act.balanceOf(activeBroker)
      await activePOAToken.simulateBurnFrom(burnAmount, activeBroker)
      const postActiveBrokerBalance = await act.balanceOf(activeBroker)
      const postTotalSupply = await act.totalSupply()
      assert.equal(preTotalSupply.minus(postTotalSupply).toString(), burnAmount.toString(), 'the total supply should be decremented by the total amount')
      assert.equal(preActiveBrokerBalance.minus(postActiveBrokerBalance).toString(), burnAmount.toString(), 'the activeBroker balance should be decremented by the burnAmount')
    })

    it('should NOT burn when not from activePOAToken or umbrella contract', async () => {
      try {
        await act.burnFrom(burnAmount, activeBroker)
        assert(false, 'the contract should throw here')
      } catch(error) {
        assert(/invalid opcode/.test(error), 'the error should contain invalid opcode')
      }
    })

    it('should NOT burn if there is NO approval for the user', async () => {
      try {
        await umbrellaStub.simulateBurnFrom(burnAmount, zeroApprovalBroker)
        assert(false, 'the contract should throw here')
      } catch(error) {
        assert(/invalid opcode/.test(error), 'the error should contain invalid opcode')
      }
    })

    it('should NOT burn if there is insufficient balance', async () => {
      try {
        await umbrellaStub.simulateBurnFrom(burnAmount, brokeBroker)
        assert(false, 'the contract should throw here')
      } catch(error) {
        assert(/invalid opcode/.test(error), 'the error should contain invalid opcode')
      }
    })

    it('should NOT burn if the token is inactive', async () => {
      try {
        await inactivePOAToken.simulateBurnFrom(burnAmount, activeBroker)
        assert(false, 'the contract should throw here')
      } catch(error) {
        assert(/invalid opcode/.test(error), 'the error should contain invalid opcode')
      }
    })
  })
})

describe('when selling', () => {
  contract('BrickblockAccessToken', accounts => {
    const owner = accounts[0]
    const buyer = accounts[1]
    const seller1 = accounts[2]
    const seller2 = accounts[3]
    const seller3 = accounts[4]
    const seller4 = accounts[5]
    const amount1 = new BigNumber(2e18)
    const amount2 = new BigNumber(1e18)
    const amount3 = new BigNumber(5e17)
    const amount4 = new BigNumber(24e16)
    let act

    before('setup BrickblockAccessToken and related contracts state', async () => {
      act = await BrickblockAccessToken.deployed()
      await act.mint(seller1, amount1)
      await act.mint(seller2, amount2)
      await act.mint(seller3, amount3)
      await act.mint(seller4, amount4)
    })

    it('should sell to seller1', async () => {
      const buyAmount = new BigNumber(1e18)
      const preTotalSupply = await act.totalSupply()
      const preSeller1Balance = await act.balanceOf(seller1)
      const preSeller1Payable = await act.payableBalanceOf(seller1)
      const tokenPurchase = await act.buyTokens({
        from: buyer,
        value: buyAmount
      })
      console.log('single seller: ', tokenPurchase)
      const postTotalSupply = await act.totalSupply()
      const postSeller1Balance = await act.balanceOf(seller1)
      const postSeller1Payable = await act.payableBalanceOf(seller1)
      const lastSeller = await act.lastSeller()

      assert.equal(
        preTotalSupply.minus(postTotalSupply).toString(),
        buyAmount.toString(),
        'the totalSupply should be decremented by buyAmount'
      )
      assert.equal(
        preSeller1Balance.minus(postSeller1Balance).toString(),
        buyAmount.toString(),
        'the seller account should be decremented by buyAmount'
      )
      assert.equal(
        postSeller1Payable.minus(preSeller1Payable).toString(),
        buyAmount.toString(),
        'the seller payableBalance should be incremented by buyAmount'
      )
      assert.equal(
        lastSeller,
        seller2,
        'the last seller should now be seller2'
      )
    })

    it('should sell to all sellers to meet full buy requirement', async () => {
      const currentSeller = await act.currentSeller()
      assert.equal(
        currentSeller,
        seller2,
        `${seller2} should be the currentSeller`
      )
      const buyAmount = new BigNumber(1e18).add(amount2).add(amount3)
      const preTotalSupply = await act.totalSupply()
      const sellers = [seller1, seller2, seller3]
      let sellerBalances = {}
      for(let seller of sellers) {
        const preTokenBalance = await act.balanceOf(seller)
        const prePayableBalance = await act.payableBalanceOf(seller)
        sellerBalances[seller] = {
          preTokenBalance,
          prePayableBalance
        }
      }
      const tokenPurchase = await act.buyTokens({
        from: buyer,
        value: buyAmount
      })
      console.log('tokenPurchaseTransaction: ', tokenPurchase)
      for(let seller of sellers) {
        const preToken = sellerBalances[seller].preTokenBalance
        const postToken = await act.balanceOf(seller)
        const prePayable = sellerBalances[seller].prePayableBalance
        const postPayable = await act.payableBalanceOf(seller)
        sellerBalances[seller].postTokenBalance = postToken
        sellerBalances[seller].postPayableBalance = postPayable
        sellerBalances[seller].tokenDiff = preToken.minus(postToken)
        sellerBalances[seller].payableDiff = postPayable.minus(prePayable)
      }
      const postTotalSupply = await act.totalSupply()
      const lastSeller = await act.lastSeller()
      console.log(sellerBalances)

      for (let seller of sellers) {
        const {
          preTokenBalance,
          tokenDiff,
          payableDiff
        } = sellerBalances[seller]
        console.log(
          'preToken',
          preTokenBalance.div(1e18).toString(),
          'tokenDiff',
          tokenDiff.div(1e18).toString(),
          'payableDiff',
          payableDiff.div(1e18).toString()
        )
        assert.equal(
          tokenDiff.toString(),
          preTokenBalance.toString(),
          `${seller} token balance should be decremented by ${preTokenBalance.toString()}`
        )
        assert.equal(
          payableDiff.toString(),
          preTokenBalance.toString(),
          `${seller} payable balance should be incremented by ${preTokenBalance.toString()}`
        )
      }
      assert.equal(
        preTotalSupply.minus(postTotalSupply).toString(),
        buyAmount.toString(),
        'the totalSupply should be decremented by buyAmount'
      )
    })
  })
})

describe('when stress testing', () => {
  contract('BrickblockAccessToken', accounts => {
    const owner = accounts[0]
    const buyer = accounts[1]
    const seller1 = accounts[2]
    const seller2 = accounts[3]
    const seller3 = accounts[4]
    const seller4 = accounts[5]
    const amount1 = new BigNumber(1e18)
    const amount2 = new BigNumber(1e18)
    const amount3 = new BigNumber(1e18)
    const amount4 = new BigNumber(1e18)
    let act

    before('setup BrickblockAccessToken and related contracts state', async () => {
      act = await BrickblockAccessToken.new(1e6, 4e16)
      await act.mint(seller1, amount1)
      await act.mint(seller2, amount2)
      await act.mint(seller3, amount3)
      await act.mint(seller4, amount4)
    })

    it('should not die please!', async () => {
      const tokenPurchase = await act.buyTokens({
        from: buyer,
        value: 4e18
      })
      console.log(
        'GAS USED: ',
        tokenPurchase.receipt.gasUsed,
        'HOPS: ',
        tokenPurchase.logs.length / 2
      )
    })
  })
})
