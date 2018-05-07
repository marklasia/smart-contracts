pragma solidity ^0.4.23;

import "truffle/Assert.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "../../contracts/PoaToken.sol";
import "truffle/DeployedAddresses.sol";


contract TestPoaToken {

  function testWeiToTokens()
    private
  {
    PoaToken poa = PoaToken(DeployedAddresses.PoaToken());
    uint256 _wei = 1e18;
    uint256 _actualTokens = poa.weiToTokens(_wei);
    // wei       fiatCents  fromWei to Wei+perc.    fundingGoalInCents
    // (1e18 *   50000 /    1e18) * 1e20          / 5e5
    uint256 _expectedTokens = 10000000000000000000;

    Assert.equal(
      _expectedTokens,
      _actualTokens,
      "weiToTokens should return correct value"
    );
  }

}
