/* eslint-disable no-console */
const { addContractsToRegistry, setFiatRate } = require('../helpers/general')
const chalk = require('chalk')

const rinkebyMigration = async (deployer, accounts, contracts) => {
  const {
    AccessToken,
    BrickblockAccount,
    ContractRegistry,
    BrickblockToken,
    ExchangeRates,
    FeeManager,
    CentralLogger,
    PoaManager,
    PoaToken,
    Whitelist,
    ExchangeRateProvider
  } = contracts
  const owner = accounts[0]
  const bonusAddress = accounts[1]

  console.log(chalk.yellow('deploying ContractRegistry...'))
  //ContractRegistry
  await deployer.deploy(ContractRegistry, {
    from: owner
  })
  const reg = await ContractRegistry.deployed()
  console.log(chalk.cyan('deployment successful!'))

  console.log(chalk.yellow('deploying BrickblockToken...'))
  //BrickblockToken
  await deployer.deploy(BrickblockToken, bonusAddress, {
    from: owner
  })
  const bbk = await BrickblockToken.deployed()
  console.log(chalk.cyan('deployment successful!'))

  console.log(chalk.yellow('deploying AccessToken...'))
  //AccessToken
  await deployer.deploy(AccessToken, reg.address, {
    from: owner
  })
  const act = await AccessToken.deployed()
  console.log(chalk.cyan('deployment successful!'))

  console.log(chalk.yellow('deploying BrickblockAccount...'))
  //BrickblockAccount
  await deployer.deploy(BrickblockAccount, reg.address, 100, {
    from: owner
  })
  const bat = await BrickblockAccount.deployed()
  console.log(chalk.cyan('deployment successful!'))

  console.log(chalk.yellow('deploying FeeManager...'))
  //FeeManager
  await deployer.deploy(FeeManager, reg.address, {
    from: owner
  })
  const fmr = await FeeManager.deployed()
  console.log(chalk.cyan('deployment successful!'))

  console.log(chalk.yellow('deploying Whitelist...'))
  //WhiteList
  await deployer.deploy(Whitelist, {
    from: owner
  })
  const wht = await FeeManager.deployed()
  console.log(chalk.cyan('deployment successful!'))

  console.log(chalk.yellow('deploying PoaManager...'))
  // PoaManager
  await deployer.deploy(PoaManager, reg.address, {
    from: owner
  })
  const pmr = await PoaManager.deployed()
  console.log(chalk.cyan('deployment successful!'))

  console.log(chalk.yellow('deploying ExchangeRates...'))
  // ExchangeRates
  await deployer.deploy(ExchangeRates, reg.address, {
    from: owner
  })
  const exr = await ExchangeRates.deployed()
  console.log(chalk.cyan('deployment successful!'))

  console.log(chalk.yellow('deploying ExchangeRateProvider...'))
  // ExchangeRateProvider
  await deployer.deploy(ExchangeRateProvider, reg.address, {
    from: owner
  })
  const exp = await ExchangeRateProvider.deployed()
  console.log(chalk.cyan('deployment successful!'))

  console.log(chalk.yellow('deploying PoaTokenMaster...'))
  // PoaToken master
  const poa = await deployer.deploy(PoaToken)
  console.log(chalk.cyan('deployment successful!'))

  console.log(chalk.yellow('deploying CentralLogger...'))
  // CentralLogger
  await deployer.deploy(CentralLogger, reg.address, {
    from: owner
  })
  const log = await CentralLogger.deployed()
  console.log(chalk.cyan('deployment successful!'))

  console.log(chalk.yellow('deploying adding contracts to ContractRegistry...'))
  await addContractsToRegistry({
    act,
    bat,
    bbk,
    exp,
    exr,
    fmr,
    log,
    owner,
    pmr,
    poa,
    reg,
    wht
  })
  console.log(chalk.cyan('registry update successful!'))

  console.log(chalk.yellow('setting ACT rate to 1e3...'))
  await exr.setActRate(1e3)
  console.log(chalk.cyan('ACT rate update successful!'))

  console.log('setting EUR rate')
  await setFiatRate(exr, exp, 'EUR', 5e4, {
    from: owner,
    value: 1e18
  })
}

const finalizeBBK = (bbk, bonusAddress) => {}
/*
what needs to be done here?

*/

/*
what is left for the owner to do?
set fiat rate
list brokers
deploy new poas
*/

module.exports = {
  rinkebyMigration
}
