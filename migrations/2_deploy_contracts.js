const BrickblockToken = artifacts.require('./BrickblockToken.sol')
const BrickblockAccessToken = artifacts.require('./BrickblockAccessToken.sol')
const PoaManager = artifacts.require('./PoaManager.sol')
const BrickblockWhitelist = artifacts.require('./BrickblockWhitelist.sol')
const BrickblockContractRegistry = artifacts.require(
  './BrickblockContractRegistry'
)

module.exports = async deployer => {
  const reg = await deployer.deploy(BrickblockContractRegistry)
  await deployer.deploy(PoaManager, reg.address)
  await deployer.deploy(
    BrickblockToken,
    '0x627306090abab3a6e1400e9345bc60c78a8bef57'
  )
  await deployer.deploy(BrickblockAccessToken, reg.address)
  await deployer.deploy(BrickblockWhitelist)
}
