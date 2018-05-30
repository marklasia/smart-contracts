pragma solidity 0.4.23;

import "./AccessToken.sol";


contract AccessTokenUpgraded is AccessToken {

  constructor(address _registry) AccessToken(_registry) {}

  function balanceOf(
    address _address
  )
    public
    view
    returns (uint256)
  {
    return totalMintedPerToken == 0
      ? 0
      : AccessToken(
        registry.getContractAddress("AccessTokenOld")
      ).balanceOf(_address)
      .add(lockedBBK[_address])
      .mul(totalMintedPerToken.sub(distributedPerBBK[_address]))
      .div(1e18)
      .add(securedTokenDistributions[_address])
      .add(receivedBalances[_address])
      .sub(spentBalances[_address]);
  } 
}