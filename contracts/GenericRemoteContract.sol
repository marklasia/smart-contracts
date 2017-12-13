pragma solidity 0.4.18;

contract GenericRemoteContract {
  uint256 public constant testNumber = 123;

  function add(uint256 _num1, uint256 _num2)
    public
    returns (uint256)
  {
    return _num1 + _num2;
  }

}
