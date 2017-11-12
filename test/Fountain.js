const Fountain = artifacts.require('Fountain')
const AccessToken = artifacts.require('AccessToken')
const BrickblockToken = artifacts.require('BrickBlockToken')
const signMessage = require('../scripts/signMessage')
const BigNumber = require('bignumber.js')

const sleep = async time =>
  await new Promise(resolve => {
    setTimeout(resolve, time)
  })

describe('Fountain contract', () => {
  contract('Fountain/AccessToken/BrickblockToken', accounts => {
      let bbt
      let act
      let fountain
      let owner
      let claimer1
      let claimer2
      let claimAmount1
      let claimAmount2
    before('setup and distribute tokens', async () => {
      bbt = await BrickblockToken.deployed()
      act = await AccessToken.deployed()
      fountain = await Fountain.deployed()
      owner = accounts[0]
      claimer1 = accounts[1]
      claimAmount1 = new BigNumber(5e24)
      claimAmount2 = new BigNumber(7e24)
      claimer2 = accounts[2]
      const signedClaim1 = await signMessage(web3, owner, claimer1, claimAmount1)
      const signedClaim2 = await signMessage(web3, owner, claimer2, claimAmount2)
      await bbt.claimTokens.sendTransaction(signedClaim1, claimAmount1, { from: claimer1 })
      await bbt.claimTokens.sendTransaction(signedClaim2, claimAmount2, { from: claimer2 })
      await bbt.finalizeTokenSale()
      await bbt.unpause()
      const claimer1Balance = bbt.balanceOf(claimer1)
      const claimer2Balance = bbt.balanceOf(claimer2)
      const tokenSaleActive = bbt.tokenSaleActive.call()
      assert(true, claimer1Balance.toString() === claimAmount1.toString(), 'account 1 balance should have the claimed amount in it')
      assert(true, claimer2Balance.toString() === claimAmount2.toString(), 'account 2 balance should have the claimed amount in it')
      assert(true, tokenSaleActive === false, 'the token sale should be over after calling finalizeTokenSale')

    })

    it('should have the right token propeties', async () => {
      const name = await act.name.call()
      const symbol = await act.symbol.call()
      const decimals = await act.decimals.call()
      const initialSupply = await act.initialSupply.call()
      const fountainAddress = await act.fountainAddress.call()
      assert(true, name === 'BrickblockAccessToken', 'the name on the contract should be "BrickblockAccessToken"')
      assert(true, symbol === 'ACT', 'the symbol on the contract should be "ACT"')
      assert(true, decimals === 18, 'the contract decimals should be 18')
      assert(true, initialSupply === web3._extend.utils.toBigNumber(1e24), 'the intial supply should be 1e24')
      assert(true, fountainAddress === fountain.address, 'the fountain address should match that of the deployed fountain contract')
    })

    it('should approve funds for spending by the fountain contract', async () => {
      await bbt.approve.sendTransaction(fountain.address, claimAmount1, { from: claimer1 })
      const approval1 = await bbt.allowance.call(claimer1, fountain.address)
      assert(true, approval1 === claimAmount1, 'the approved amount to spend should equal the approveAmount set')
    })

    it('should lock the funds when sent to fountain', async () => {
      const unlockDate = parseInt((parseInt(Date.now()) + 1000) / 1000)
      const preBBTFountainBalance = await bbt.balanceOf(fountain.address)
      const preBBTLockerBalance = await bbt.balanceOf(fountain.address)
      await fountain.lockFunds.sendTransaction(claimAmount1, unlockDate, { from: claimer1 })
      // returns array as [bbtAmount, actAmount, dateLocked, dateUnlocked]
      const lockedBalance = await fountain.lockedBalances(claimer1)
      const postBBTFountainBalance = await bbt.balanceOf(fountain.address)
      const postBBTLockerBalance = await bbt.balanceOf(claimer1)
      assert(true, lockedBalance[1].toString() === claimAmount1.toString(), 'the locked amount should the the BBT approved amount locked in fountain contract')
      assert(true, postBBTFountainBalance.minus(postBBTFountainBalance).toString() === claimAmount1.toString(), 'the balance should be increased by the claimed amount that was locked in for the fountain contract')
      assert(true, preBBTLockerBalance.minus(postBBTLockerBalance).toString() === claimAmount1.toString(), 'the balance of the locker should be decreased by the claimed amount that was locked in the fountain contract')
    })

    it('should return funds to the address that locked the funds when the time is up', async () => {
      const tempACTReturnAmount = new BigNumber(1000)
      await sleep(1001)
      const preBBTFountainBalance = await bbt.balanceOf(fountain.address)
      const preBBTLockerBalance = await bbt.balanceOf(claimer1)
      const preACTLockerBalance = await act.balanceOf(claimer1)
      await fountain.claimFunds.sendTransaction({from: claimer1})
      const postBBTFountainBalance = await bbt.balanceOf(fountain.address)
      const postBBTLockerBalance = await bbt.balanceOf(claimer1)
      const postACTLockerBalance = await act.balanceOf(claimer1)
      assert(true, preBBTFountainBalance.minus(postBBTFountainBalance).toString() === claimAmount1.toString(), 'the BBT balance of the fountain contract should be deducted by the claim amount')
      assert(true, postBBTLockerBalance.minus(preBBTLockerBalance).toString() === claimAmount1.toString())
      assert(true, postACTLockerBalance.minus(preACTLockerBalance).toString() === tempACTReturnAmount.toString(), 'the locker should have the correct balance of ACT after claiming funds')
    })
  })
})
