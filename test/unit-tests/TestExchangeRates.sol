pragma solidity 0.4.18;

import "truffle/Assert.sol";
import "../../contracts/ExchangeRates.sol";
import "../../contracts/BrickblockContractRegistry.sol";

contract TestExchangeRates {

  ExchangeRates public exr;

  function beforeEach() public {
    BrickblockContractRegistry reg = new BrickblockContractRegistry();
    exr = new ExchangeRates(address(reg));
  }

}
