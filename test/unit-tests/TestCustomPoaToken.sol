pragma solidity 0.4.18;

import "truffle/Assert.sol";

import "../../contracts/CustomPOAToken.sol";

contract TestCustomPoaToken {

  CustomPOAToken private cpoa = new CustomPOAToken(
      'ProofOfAwesome',
      'POA',
      address(1),
      address(2),
      50,
      33e18,
      10e18
    );

  uint256 private remainder;

  function testWeiToTokens() {
    uint256 _wei = 2037635681364390948;
    uint256 _expectedTokens = 6724197748502490128;
    uint256 _tokens;
    uint256 _remainder;

    (_tokens, remainder) = cpoa.weiToTokens(_wei);

    Assert.equal(
      _tokens,
      _expectedTokens,
      "tokens from wei should match expected amount"
    );
  }

  function testTokensToWei() {
    uint256 _tokens = 6724197748502490128 - remainder;
    uint256 _expectedWei = 2037635681364390948;

    uint256 _wei = cpoa.tokensToWei(_tokens);

    Assert.equal(
      _wei,
      _expectedWei,
      "wei from tokens should match expected amount"
    );
  }
}
