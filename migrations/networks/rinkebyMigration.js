/* eslint-disable no-console */
const chalk = require('chalk')
const bbk = require('../helpers/bbk')
const BigNumber = require('bignumber.js')

const {
  deployContracts,
  addContractsToRegistry,
  setFiatRate
} = require('../helpers/general')

const rinkebyMigration = async (deployer, accounts, contracts) => {
  const owner = accounts[0]
  const contributors = accounts.slice(2, 5)

  const instances = await deployContracts(deployer, accounts, contracts, {
    useExpStub: false
  })

  await addContractsToRegistry({ contracts: instances, owner })

  console.log(chalk.yellow('setting ACT rate to 1e3...'))
  await instances.exr.setActRate(1e3)
  console.log(chalk.cyan('ACT rate update successful!'))

  console.log('setting EUR rate')
  await setFiatRate(instances.exr, instances.exp, 'EUR', 5e4, {
    from: owner,
    value: 2e18
  })

  await bbk.finalizeBbk(
    instances.bbk,
    owner,
    instances.bat.address,
    contributors,
    new BigNumber('1e21')
  )
}

module.exports = {
  rinkebyMigration
}
