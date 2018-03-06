const assert = require('assert')
const BigNumber = require('bignumber.js')
const CustomPoaToken = artifacts.require('CustomPoaToken')

const { getEtherBalance } = require('../cpoa')

let cpoa
const accounts = web3.eth.accounts
const broker = accounts[1]
const custodian = accounts[2]
const investors = accounts.slice(4)

/* eslint-disable no-console */

const getAccountInformation = async (address, contract) => {
  const etherBalance = await getEtherBalance(address)
  const tokenBalance = await contract.balanceOf(address)
  const currentPayout = await contract.currentPayout(address, true)

  return {
    etherBalance,
    tokenBalance,
    currentPayout
  }
}

const activeContract = async (_totalSupply, _fundingGoal) => {
  const totalSupply = new BigNumber(_totalSupply)
  const fundingGoal = new BigNumber(_fundingGoal)
  const contract = await CustomPoaToken.new(
    'ProofOfAwesome',
    'POA',
    broker,
    custodian,
    web3.eth.blockNumber + 200,
    totalSupply,
    fundingGoal
  )
  let remainingFunding = fundingGoal.sub(await contract.fundedAmount())
  await Promise.all(
    investors.map(investor => contract.whitelistAddress(investor))
  )
  let i = 0
  while (remainingFunding.greaterThan(0)) {
    const stage = await contract.stage()
    assert.equal(stage.toString(), '0', 'should be in funding stage')
    const investAmount = BigNumber.min(
      remainingFunding,
      BigNumber.random(18)
        .mul(fundingGoal.div(6))
        .floor()
    )

    const contractTokenBalance = await contract.balanceOf(contract.address)
    const tokenInvestAmountData = await contract.weiToTokens(investAmount)
    const tokenInvestAmount = tokenInvestAmountData[0]

    console.log(
      'contractBalance',
      contractTokenBalance.toString(),
      'tokenInvestAmount',
      tokenInvestAmount.toString(),
      'ethInvestAmount',
      investAmount.toString()
    )

    await contract.buy({
      from: investors[i % investors.length],
      value: investAmount
    })

    const newFundedAmount = await contract.fundedAmount()
    remainingFunding = fundingGoal.sub(newFundedAmount)

    console.log(
      'remaining funding',
      remainingFunding.div(1e18).toString(),
      'invest amount',
      investAmount.div(1e18).toString()
    )

    i++
  }

  assert.equal(
    (await contract.stage()).toString(),
    '1',
    'should be in penidng stage now'
  )
  const fee = await contract.calculateFee(fundingGoal)
  await contract.activate({ from: custodian, value: fee })
  console.log('claiming for OWNER (activation fee)')
  await contract.claim()
  console.log('claiming for CUSTODIAN (activation contract value)')
  await contract.claim.sendTransaction({
    from: custodian
  })
  assert.equal(
    (await contract.stage()).toString(),
    '3',
    'should be in active stage now'
  )
  return contract
}

const claimAll = async investorAccounts => {
  const payouts = investorAccounts.map(() => new BigNumber(0))
  for (let i = 0; i < investorAccounts.length; i += 1) {
    try {
      const investor = investorAccounts[i]
      const claimableAmount = await cpoa.currentPayout(investor, true)
      assert(claimableAmount.greaterThan(0), "0 balance won't claim")
      console.log(
        `claiming for ${investor} ${claimableAmount.div(1e18).toString()}`
      )
      const meta = await cpoa.claim({ from: investor, gasPrice: 0 })
      const payoutValue = meta.logs[0].args.payout
      payouts[i] = payoutValue
    } catch (error) {
      assert(
        !/invalid opcode/.test(error),
        'Claim Failed(',
        await web3.eth.getBalance(cpoa.address),
        ') : ' + error.message
      )
      console.error(error)
    }
  }

  return payouts
}

/* eslint-enable no-console */

module.exports = {
  getAccountInformation,
  activeContract,
  claimAll
}
