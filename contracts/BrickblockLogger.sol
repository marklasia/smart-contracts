pragma solidity ^0.4.23;

interface IContractRegistry {
  function getContractAddress(string _name)
    external
    view
    returns (address);
}

interface IPoaManager {
  function getTokenStatus(address _tokenAddress)
    external
    view
    returns(bool);
}


contract BrickblockLogger {
  // TODO: is this cheaper when we store as an address and cast to Registry when we need it?
  address public registry;

  constructor(
    address _registryAddress
  )
    public
  {
    require(_registryAddress != address(0));
    registry = _registryAddress;
  }


  modifier onlyActivePoaToken(address _tokenAddress) {
    require(
      IPoaManager(
        IContractRegistry(registry).getContractAddress('PoaManager')
      ).getTokenStatus(_tokenAddress)
    );
    _;
  }

  event BuyEvent(address indexed poa, address indexed buyer, uint256 amount);

  function logBuyEvent(address buyer, uint256 amount)
    external
    onlyActivePoaToken(msg.sender)
  {
    emit BuyEvent(msg.sender, buyer, amount);
  }
}
