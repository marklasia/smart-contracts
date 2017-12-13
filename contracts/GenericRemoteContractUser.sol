pragma solidity 0.4.18;

import "./BrickblockContractRegistry.sol";
import "./GenericRemoteContract.sol";


contract GenericRemoteContractUser {

  address public owner;
  BrickblockContractRegistry private contractRegistry;

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  function GenericRemoteContractUser()
    public
  {
    owner = msg.sender;
  }

  function remoteAdd(uint256 _num1, uint256 _num2)
    public
    returns (uint256)
  {
    require(contractRegistry != address(0));
    GenericRemoteContract genericRemoteContract = GenericRemoteContract(
      contractRegistry.getContractAddress("GenericRemoteContract")
    );
    return genericRemoteContract.add(_num1, _num2);
  }

  function remoteString()
    public
    returns (uint256)
  {
    require(contractRegistry != address(0));
    GenericRemoteContract genericRemoteContract = GenericRemoteContract(
      contractRegistry.getContractAddress("GenericRemoteContract")
    );
    return genericRemoteContract.testNumber();
  }

  function setContractRegistry(address _registryAddress)
    public
    onlyOwner
  {
    contractRegistry = BrickblockContractRegistry(_registryAddress);
  }
}
