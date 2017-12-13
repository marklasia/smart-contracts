const BrickblockToken = artifacts.require('./BrickblockToken.sol')
const BrickblockTokenUpgraded = artifacts.require(
  './BrickblockTokenUpgraded.sol'
)
const BrickblockFountain = artifacts.require('./BrickblockFountain.sol')
const BrickblockAccessToken = artifacts.require('./BrickblockAccessToken.sol')
const BrickblockUmbrella = artifacts.require('./BrickblockUmbrella.sol')
const BrickblockWhitelist = artifacts.require('./BrickblockWhitelist.sol')
const BrickblockContractRegistry = artifacts.require(
  'BrickblockContractRegistry'
)
const GenericRemoteContract = artifacts.require('GenericRemoteContract')
const GenericRemoteContractUser = artifacts.require('GenericRemoteContractUser')

module.exports = async (deployer, network) => {
  if (network === 'dev' || network === 'test') {
    deployer.then(async () => {
      await deployer.deploy(BrickblockUmbrella)
      await deployer.deploy(BrickblockToken)
      await deployer.deploy(BrickblockFountain)
      await deployer.deploy(BrickblockAccessToken, 25e16, 1e18)
      await deployer.deploy(BrickblockWhitelist)
      await deployer.deploy(BrickblockContractRegistry)
      await deployer.deploy(GenericRemoteContract)
      await deployer.deploy(GenericRemoteContractUser)
      const bbf = await BrickblockFountain.deployed()
      const act = await BrickblockAccessToken.deployed()
      const bbk = await BrickblockToken.deployed()
      await act.changeFountainAddress(bbf.address)
      await bbf.changeAccessTokenLocation(act.address)
      await bbf.changeBrickblockTokenLocation(bbk.address)
    })
  } else {
    deployer.then(async () => {
      await deployer.deploy(BrickblockToken)
    })
  }
}
