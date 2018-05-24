/* eslint-disable no-console */

const BigNumber = require('bignumber.js')
const chalk = require('chalk')
const {
  whitelistedPoaBuyers,
  setupPoaAndEcosystem,
  testStartSale,
  determineNeededTimeTravel,
  testBuyTokensMultiWithIndiviualAmounts
} = require('../helpers/poa')
const {
  timeTravel,
  generateRandomAmountForAccounts
} = require('../helpers/general.js')

describe('PoaToken Stress Tests', () => {
  let poa
  let exr
  const fiatRate = new BigNumber(58000)
  //let fmr

  describe('Simulate funding', () => {
    contract('POA', () => {
      before('setup', async () => {
        const contracts = await setupPoaAndEcosystem({
          fundingGoal: new BigNumber(25000000),
          fiatRate
        })

        poa = contracts.poa
        exr = contracts.exr
        //fmr = contracts.fmr

        const neededTime = await determineNeededTimeTravel(poa)

        await timeTravel(neededTime)
        await testStartSale(poa)
      })

      it('starts funding with random amount until funding completes', async () => {
        let isFundingGoalReached = false
        let roundCount = 1
        const fundingGoalInCents = await poa.fundingGoalInCents()
        const fundingGoalWei = await poa.fiatCentsToWei(fundingGoalInCents)
        console.log(chalk.red('rate'), (await exr.getRate('EUR')).toString())
        console.log(
          chalk.red('fiatCentsToWei', await poa.fiatCentsToWei(10000))
        )

        while (!isFundingGoalReached) {
          const fundedAmountInWei = await poa.fundedAmountInWei()
          const remainingBuyableEth = fundingGoalWei.sub(fundedAmountInWei)

          console.log(
            'fundedAmountInEth',
            web3.fromWei(fundedAmountInWei).toString(),
            'fundingGoalInCents',
            fundingGoalInCents.toString(),
            'fundingGoalEth',
            web3.fromWei(fundingGoalWei).toString(),
            chalk.yellow('remainingBuyableEth'),
            web3.fromWei(remainingBuyableEth).toString()
          )

          const remainingMax = remainingBuyableEth.gt(1e19)
            ? new BigNumber(1e19)
            : remainingBuyableEth
          const buyers = await generateRandomAmountForAccounts(
            whitelistedPoaBuyers,
            {
              remainingMax,
              min: 1e18
            }
          )

          //fiatRate = getRandomBigInt(fiatRate.mul(0.9), fiatRate.mul(1.1))
          //await testSetRate(exr, exp, fiatRate, false)

          //console.log(chalk.magenta('new fiat rate', fiatRate))
          buyers.map(buyer => {
            // eslint-disable-next-line
            console.log('address', buyer.account)
            // eslint-disable-next-line
            console.log('amount', web3.fromWei(buyer.amount).toString())
          })

          await testBuyTokensMultiWithIndiviualAmounts(poa, buyers)

          if (buyers.length === 0) isFundingGoalReached = true
          // eslint-disable-next-line
          console.log(chalk.green(`**** Round ${roundCount} passed`))
          roundCount++
        }
      })
    })
  })
})
