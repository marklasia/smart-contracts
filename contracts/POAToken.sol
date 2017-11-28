pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/PausableToken.sol";
import "./BrickblockAccessToken.sol";
import "./BrickblockWhitelist.sol";


// Proof-of-Asset contract representing a token backed by a foreign asset.
contract POAToken is PausableToken {

  BrickblockWhitelist brickblockWhitelist;
  BrickblockAccessToken brickblockAccessToken;

  event Stage(Stages stage);
  event Buy(address buyer, uint256 amount);
  event Sell(address seller, uint256 amount);
  event Payout(uint256 amount);

  string public name;
  string public symbol;

  uint8 public constant decimals = 18;

  address public owner;
  address public broker;
  address public custodian;

  // The time when the contract was created
  uint256 public creationBlock;

  // The time available to fund the contract
  uint256 public timeoutBlock;

  uint256 public constant feePercentage = 5;

  mapping(address => uint256) claimedPayouts;

  uint256 public totalPayout = 0;

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

  modifier onlyBroker() {
    require(msg.sender == broker);
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

  // TODO: do we really want the user to hold the balance? lots of room for
  // fishy stuff to happen... better to have contract hold the balance i think
  // Create a new POAToken contract.
  function POAToken
  (
    string _name,
    string _symbol,
    address _broker,
    address _custodian,
    uint _timeoutBlock,
    uint256 _supply
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
    balances[owner] = _supply;
    paused = true;
  }

  // TODO: this function is temporary until registry contract is created... remove later!
  function changeWhitelist(address _address)
    public
    onlyOwner
    returns (bool)
  {
    brickblockWhitelist = BrickblockWhitelist(_address);
    return true;
  }

  // TODO: this function is temporary until registry contract is created... remove later!
  function changeAccessToken(address _address)
    public
    onlyOwner
    returns (bool)
  {
    brickblockAccessToken = BrickblockAccessToken(_address);
    return true;
  }

  function unpause()
    public
    onlyOwner
  {
    require(stage != Stages.Terminated);
    super.unpause();
  }

  function calculateFee(uint256 _value)
    public
    view
    returns (uint256)
  {
    return feePercentage.mul(_value).div(1000);
  }

  // Used to charge fees for broker transactions
  function burnAccessTokens(uint256 _value, address _burnAddress)
    private
    returns (bool)
  {
    require(address(brickblockAccessToken) != address(0));
    return brickblockAccessToken.burnFrom(_value, _burnAddress);
  }

  // Buy PoA tokens from the contract.
  // Called by any investor during the `Funding` stage.
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
    Buy(msg.sender, msg.value);

    if (balances[owner] == 0) {
      enterStage(Stages.Pending);
    }
    return true;
  }

  // Activate the PoA contract, providing a valid proof-of-assets.
  function activate()
    public
    onlyCustodian
    checkTimeout
    atStage(Stages.Pending)
    returns (bool)
  {
    uint256 _fee = calculateFee(totalSupply);
    require(burnAccessTokens(_fee, msg.sender));
    enterStage(Stages.Active);
    custodian.transfer(this.balance);
    paused = false;
    return true;
  }

  // end the token due to asset getting sold/lost/act of god
  function terminate()
    public
    onlyOwner
    atStage(Stages.Active)
    returns (bool)
  {
    require(stage == Stages.Pending || stage == Stages.Active);
    paused = true;
    enterStage(Stages.Terminated);
  }

  // Reclaim funds after failed funding run.
  // Called by any investor during the `Failed` stage.
  function reclaim()
    public
    checkTimeout
    atStage(Stages.Failed)
    returns (bool)
  {
    uint256 balance = balances[msg.sender];
    balances[msg.sender] = 0;
    totalSupply = totalSupply.sub(balance);
    msg.sender.transfer(balance);
    return true;
  }

  // Provide funds from a dividend payout.
  // Called by the broker after the asset yields dividends.
  // This will simply add the received value to the stored `payout`.
  function payout()
    payable
    public
    atStage(Stages.Active)
    onlyCustodian
    returns (bool)
  {
    require(msg.value > 0);
    uint256 _fee = calculateFee(msg.value);
    require(burnAccessTokens(_fee, msg.sender));
    totalPayout = totalPayout.add(msg.value.mul(10e18).div(totalSupply));
    Payout(msg.value);
    return true;
  }

  function currentPayout(address _address)
    public
    view
    returns (uint256)
  {
    uint256 _balance = balances[_address];
    uint256 _claimedPayout = claimedPayouts[_address];
    uint256 _totalUnclaimed = totalPayout.sub(_claimedPayout);
    return _balance.mul(_totalUnclaimed).div(10e18);
  }

  // Claim dividend payout.
  // Called by any investor after dividends have been received.
  // This will calculate the payout, subtract any already claimed payouts,
  // update the claimed payouts for the given account, and send the payout.
  function claim()
    public
    atStage(Stages.Active)
    returns (uint256)
  {
    uint256 _payoutAmount = currentPayout(msg.sender);
    require(_payoutAmount > 0);
    claimedPayouts[msg.sender] = totalPayout;
    msg.sender.transfer(_payoutAmount);
    return _payoutAmount;
  }

  function settleTransferClaims(address _from, address _to)
    private
    returns (bool)
  {
    // send any remaining unclaimed ETHER payouts for _from and _to
    uint256 fromPayoutAmount = currentPayout(msg.sender);
    uint256 toPayoutAmount = currentPayout(msg.sender);
    if (fromPayoutAmount > 0) {
      claimedPayouts[msg.sender] = totalPayout;
      msg.sender.transfer(fromPayoutAmount);
    }

    if (toPayoutAmount > 0) {
      claimedPayouts[_to] = totalPayout;
      _to.transfer(toPayoutAmount);
    }
  }

  // TODO: verify that there are no issues with sending to _to here
  function transfer(address _to, uint256 _value)
    public
    returns (bool)
  {
    settleTransferClaims(msg.sender, _to);
    super.transfer(_to, _value);
  }

  function transferFrom(address _from, address _to, uint256 _value)
    public
    returns (bool)
  {
    settleTransferClaims(_from, _to);
    super.transferFrom(_from, _to, _value);
  }

  function()
    public
    payable
  {
    buy();
  }

}
