const BigNumber = require('bignumber.js')
const {
  getEtherBalance,
  getRandomInt,
  getRandomBig
} = require('../helpers/general')
const chalk = require('chalk')

const {
  setupContracts,
  testUnlockBBK,
  testApproveAndLockManyWithIndividualAmounts,
  testPayFee,
  testClaimFeeMany,
  testTransferActManyWithIndividualAmounts,
  generateRandomLockAmounts
} = require('../helpers/act')

describe('AccessToken Stress Tests', () => {
  describe('test scenarios with random numbers', () => {
    contract('AccessToken', accounts => {
      const owner = accounts[0]
      const bonusAddress = accounts[1]
      const feePayer = accounts[2]
      const contributors = accounts.slice(3, 7)
      const recipient = accounts[8]
      const feePayer2 = accounts[9]
      const tokenDistAmount = new BigNumber(1e24)
      const actRate = new BigNumber(100)
      let bbk
      let act
      let fmr

      before('setup contracts', async () => {
        const contracts = await setupContracts(
          owner,
          bonusAddress,
          contributors,
          tokenDistAmount,
          actRate
        )
        bbk = contracts.bbk
        act = contracts.act
        fmr = contracts.fmr
      })

      it('lock BBK -> Pay Fees -> Claim fees', async () => {
        // eslint-disable-next-line
        console.log(chalk.magenta(`Testing lock BBK -> Pay Fees -> Claim fees`))

        let i = 0
        let feeValue
        let feePayerHasMoney = true

        // Loop until there is no money left in peeFayer account
        while (feePayerHasMoney) {
          const feePayerBalance = await getEtherBalance(feePayer)
          const feePayerExp = feePayerBalance.e //exponent number
          feeValue = getRandomBig(10, feePayerExp).mul(
            Math.pow(10, getRandomInt(18, feePayerExp - 1))
          )
          feeValue = feeValue.sub(feeValue.mod(10)) // get rid of dusts

          // eslint-disable-next-line
          console.log(
            chalk.green('fee value eth', web3.fromWei(feeValue).toString())
          )

          if (feeValue.gt(feePayerBalance.sub(1e10))) {
            feeValue = feePayerBalance.div(2)
            feePayerHasMoney = false
          }

          // Lock random amount of BBK Tokens first
          await testApproveAndLockManyWithIndividualAmounts(
            bbk,
            act,
            contributors,
            await generateRandomLockAmounts(contributors)
          )

          // eslint-disable-next-line
          console.log(
            chalk.yellow('testApproveAndLockManyWithIndividualAmounts')
          )

          await testPayFee(act, fmr, feePayer, contributors, feeValue, actRate)

          // eslint-disable-next-line
          console.log(chalk.yellow('->testPayFee'))

          //Contributors should funded after claiming fee
          await testClaimFeeMany(act, fmr, contributors, actRate)

          // eslint-disable-next-line
          console.log(chalk.green(`Passed ${i + 1} times`))
          i++
        }
      })

      it('lock BBK -> Pay Fees -> transfer ACT -> Claim Fee -> Unlock BBK', async () => {
        // eslint-disable-next-line
        console.log(
          chalk.magenta(
            `Testing ock BBK -> Pay Fees -> transfer ACT -> Claim Fee -> Unlock BBK 10 rounds`
          )
        )
        const feeValue = new BigNumber(1e10)
        for (let i = 0; i <= 10; i++) {
          // Lock random amount of BBK Tokens first
          await testApproveAndLockManyWithIndividualAmounts(
            bbk,
            act,
            contributors,
            await generateRandomLockAmounts(contributors)
          )

          await testPayFee(act, fmr, feePayer2, contributors, feeValue, actRate)

          const actBalances = await Promise.all(
            contributors.map(async contributor => {
              return await act.balanceOf(contributor)
            })
          )
          await testTransferActManyWithIndividualAmounts(
            act,
            contributors,
            recipient,
            actBalances
          )

          await testClaimFeeMany(act, fmr, [recipient], actRate)

          await Promise.all(
            contributors.map(async contributor => {
              const lockedBbkAmount = await act.lockedBbkOf(contributor)

              await testUnlockBBK(bbk, act, contributor, lockedBbkAmount)
            })
          )

          // eslint-disable-next-line
          console.log(chalk.green(`Passed ${i + 1} times`))
        }
      })
    })
  })
})
