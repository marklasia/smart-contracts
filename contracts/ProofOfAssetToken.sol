pragma solidity 0.4.18;


import "zeppelin-solidity/contracts/token/PausableToken.sol";
import "./BrickblockContractRegistry.sol";
import "./BrickblockAccessToken.sol";
import "./BrickblockWhitelist.sol";

contract ProofOfAssetToken is PausableToken {
  string name;
  string symbol;
  address broker;
  address custodian;
  uint256 public constant feePercentage = 5;
  uint256 creationBlock;
  uint256 timeoutBlock;
  // amount of access tokens needed for an action currently
  uint256 accessTokensNeeded;
  // grace period for any accessToken sale
  uint256 gracePeriod;
  // grace period where everyone can sell their fair share for current accessToken sale
  uint256 accessTokenSaleGracePeriod;
  bool accessTokenSaleActive;
  // registry contract to get addresses of any other needed contracts
  BrickblockContractRegistry contractRegistry;

  enum Stages {
    Funding,
    Pending,
    Failed,
    Active,
    Terminated
  }

  Stages public stage = Stages.Funding;

  modifier atStage(Stages _stage) {
    require(stage == _stage);
    _;
  }

  modifier onlyCustodian() {
    require(msg.sender == custodian);
    _;
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  modifier isWhitelisted() {
    address whitelistAddress = contractRegistry.getContractAddress('bbWhitelist');
    BrickblockWhitelist brickblockWhitelist = brickblockWhitelist(whitelistAddress);
    require(brickblockWhitelist.whitelisted(msg.sender));
    _;
  }

  function enterStage(Stages _stage)
    private
  {
    stage = _stage;
    Stage(_stage);
  }

  // Ensure funding timeoutBlock hasn't expired
  modifier checkTimeout() {
    if (stage == Stages.Funding && block.number >= creationBlock.add(timeoutBlock)) {
      enterStage(Stages.Failed);
    }
    _;
  }

  modifier canSellAct() {
    require(accessTokenSaleActive == true);
  }

  function ProofOfAssetToken
  (
    string _name,
    string _symbol,
    address _contractRegistry,
    address _broker,
    address _custodian,
    address _registryAddress,
    uint _timeoutBlock,
    uint256 _totalSupply,
    uint256 _gracePeriod
  )
    public
  {
    owner = msg.sender;
    name = _name;
    symbol = _symbol;
    broker = _broker;
    custodian = _custodian;
    timeoutBlock = _timeoutBlock;
    creationBlock = block.number;
    totalSupply = _supply;
    balances[this] = _supply;
    contractRegistry = BrickblockContractRegistry(_registryAddress);
    gracePeriod = _gracePeriod;
    paused = true;
  }

  function unpause()
    public
    onlyOwner
  {
    require(stage != Stages.Terminated);
    super.unpause();
  }

  function startAccessTokenSale(_fee)
    private
    returns (bool)
  {
    require(accessTokenSaleActive == false);
    accessTokenSaleActive = true;
    accessTokensNeeded = _fee;
    accessTokenSaleGracePeriod = block.number.add(gracePeriod);
    return true;
  }

  function finishAccessTokenSale()
    private
    returns (bool)
  {
    require(accessTokenSaleActive == true);
    require(accessTokensNeeded == 0);
    accessTokenSaleGracePeriod = 0;
    return true;
  }

  function sellAccessTokens()
    public
    canSellAct
  {
    /*
    what needs to be done here?
      need to sell act to contract
      contract needs to hold onto the balances
      need to do with approval???
      is there a better way???
      i dont think so...
      approval and then the contract runs trasferFrom....
      send ether over to the guy transferringFrom
    */
  }

  function buy()
    payable
    public
    checkTimeout
    atStage(Stages.Funding)
    isWhitelisted
    returns (bool)
  {
    balances[owner] = balances[owner].sub(msg.value);
    balances[msg.sender] = balances[msg.sender].add(msg.value);

    if (balances[owner] == 0) {
      enterStage(Stages.Pending);
    }
    return true;
  }

  function startActivation()
    public
    onlyCustodian
    checkTimeout
    atStage(Stages.Pending)
    payable
    returns (bool)
  {
    uint256 _fee = calculateFee(totalSupply);
    require(msg.value == _fee);
    startAccessTokenSale(_fee);
    return true;
  }

  // used to finish activation when all act has been sold to contract...
  function finalizeActivation()
    public
    onlyCustodian
    atStage(Stages.Pending)
    returns (bool)
  {
    finishAccessTokenSale();
    custodian.transfer(this.balance);
    enterStage(Stages.Active);
    paused = false;
  }
}
