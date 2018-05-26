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

interface IPoaToken {
  function proofOfCustody()
    external
    view
    returns (string);
}


contract BrickblockLogger {
  // TODO: is this cheaper when we store as an address and cast to Registry when we need it?
  IContractRegistry public registry;

  constructor(
    address _registryAddress
  )
    public
  {
    require(_registryAddress != address(0));
    registry = IContractRegistry(_registryAddress);
  }

  modifier onlyActivePoaToken() {
    require(
      IPoaManager(
        registry.getContractAddress("PoaManager")
      ).getTokenStatus(msg.sender)
    );
    _;
  }

  // possible events from a PoaToken
  event StageEvent(
    address indexed tokenAddress, 
    uint256 stage
  );
  event BuyEvent(
    address indexed tokenAddress, 
    address indexed buyer, 
    uint256 amount
  );
  event ProofOfCustodyUpdatedEvent(
    address indexed tokenAddress, 
    string ipfsHash
  );
  event PayoutEvent(
    address indexed tokenAddress, 
    uint256 amount
  );
  event ClaimEvent(
    address indexed tokenAddress, 
    address indexed claimer, 
    uint256 payout
  );
  event TerminatedEvent(
    address indexed tokenAddress
  );
  event ReclaimEvent(
    address indexed tokenAddress, 
    address indexed reclaimer, 
    uint256 amount
  );
  event CustodianChangedEvent(
    address indexed tokenAddress, 
    address newAddress
  );

  // event triggers for each event
  function logStageEvent(uint256 stage)
    external
    onlyActivePoaToken
  {
    emit StageEvent(msg.sender, stage);
  }

  function logBuyEvent(address buyer, uint256 amount)
    external
    onlyActivePoaToken
  {
    emit BuyEvent(msg.sender, buyer, amount);
  }

  function logProofOfCustodyUpdatedEvent(string _ipfsHash)
    external
    onlyActivePoaToken
  {

    // there is a better way to do this... need to investigate more...
    // probably more simple and cleaner in code to do this way... poa already too cluttered...
    string memory _realIpfsHash = IPoaToken(msg.sender).proofOfCustody();

    emit ProofOfCustodyUpdatedEvent(
      msg.sender,
      _realIpfsHash
    );
  }
}
