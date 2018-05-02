import "truffle/Assert.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "../../contracts/PoaTokenConcept.sol";
import "truffle/DeployedAddresses.sol";

contract TestPoaTokenConcept {

  PoaTokenConcept private poac = PoaTokenConcept(
    DeployedAddresses.PoaTokenConcept()
  );

  function testWeiToTokens() {
    uint256 _wei = 1e18;
    uint256 _actualTokens = poac.weiToTokens(_wei);
    uint256 _expectedTokens = 1e18;

    Assert.equal(
      _expectedTokens,
      _actualTokens,
      "weiToTokens should return correct value"
    );
  }

}
