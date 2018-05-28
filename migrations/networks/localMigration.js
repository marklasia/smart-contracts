/* eslint-disable no-console */
const { addContractsToRegistry, setFiatRate } = require('../helpers/general')

const localMigration = async (deployer, accounts, contracts) => {
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
    ExchangeRateProviderStub
  } = contracts
  const owner = accounts[0]
  const bonusAddress = accounts[1]

  await deployer.deploy(ContractRegistry, {
    from: owner
  })
  const reg = await ContractRegistry.deployed()

  //Brickblock Token
  await deployer.deploy(BrickblockToken, bonusAddress, {
    from: owner
  })
  const bbk = await BrickblockToken.deployed()

  //AccessToken
  await deployer.deploy(AccessToken, reg.address, {
    from: owner
  })
  const act = await AccessToken.deployed()

  //BrickblockAccount
  await deployer.deploy(BrickblockAccount, reg.address, 100, {
    from: owner
  })
  const bat = await BrickblockAccount.deployed()

  //FeeManager
  await deployer.deploy(FeeManager, reg.address, {
    from: owner
  })
  const fmr = await FeeManager.deployed()

  //WhiteList
  await deployer.deploy(Whitelist, {
    from: owner
  })
  const wht = await FeeManager.deployed()

  // PoaManager
  await deployer.deploy(PoaManager, reg.address, {
    from: owner
  })
  const pmr = await PoaManager.deployed()

  // ExchangeRates
  await deployer.deploy(ExchangeRates, reg.address, {
    from: owner
  })
  const exr = await ExchangeRates.deployed()

  // ExchangeRateProvider
  await deployer.deploy(ExchangeRateProviderStub, reg.address, {
    from: owner
  })
  const exp = await ExchangeRateProviderStub.deployed()

  // PoaToken master
  const poa = await deployer.deploy(PoaToken)

  // CentralLogger
  await deployer.deploy(CentralLogger, reg.address, {
    from: owner
  })
  const log = await CentralLogger.deployed()

  console.log('adding contracts to the registry')
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

  console.log('setting ACT rate')
  await exr.setActRate(1e3)

  console.log('setting EUR rate')
  await setFiatRate(exr, exp, 'EUR', 5e4, {
    from: owner,
    value: 1e18
  })
}

module.exports = {
  localMigration
}
