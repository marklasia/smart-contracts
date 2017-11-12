const BrickblockToken = artifacts.require("./BrickblockToken.sol")
const Brickblock = artifacts.require("./Brickblock.sol")
const Fountain = artifacts.require("./Fountain.sol")
const AccessToken = artifacts.require("./AccessToken.sol")

module.exports = deployer => {
  deployer.deploy(BrickblockToken)
  deployer.deploy(Brickblock)
  deployer.deploy(Fountain);
  deployer.deploy(AccessToken);
  deployer.then(async () => {
    const fountain = await Fountain.deployed()
    const accessToken = await AccessToken.deployed()
    const brickblockToken = await BrickblockToken.deployed()
    await accessToken.changeFountainLocation(fountain.address)
    await fountain.changeAccessTokenLocation(accessToken.address)
    await fountain.changeBrickblockTokenLocation(brickblockToken.address)
  })
};
