pragma solidity 0.4.18;

import "zeppelin-solidity/contracts/token/PausableToken.sol";


// limited BrickblockContractRegistry definintion
contract Registry {
  function getContractAddress(string _name)
    public
    view
    returns (address)
  {}
}


// limited BrickblockFeeManager definition
contract FeeManager {
  function payFee()
    public
    payable
    returns (bool)
  {}
}


// limited BrickblockWhitelist
contract Whitelist {
  mapping (address => bool) public whitelisted;
}


// limited ExchangeRates definition
contract ExR {
  function getRate(bytes8 _queryTypeBytes)
    public
    view
    returns (uint256)
  {}

  // temp used to get rate... will use getRate later when updated to use string
  // relates 0.4.22
  function getRateReadable(string _queryTypeString)
    external
    view
    returns (uint256)
  {}
}


/*
TODO:
  funding:
    make it work with ExchangeRates √

  admin functions:
    allow poaManager to:
    pause/unpause √ (needs to be implemented in PoaManager)
    put in terminated status √

  activation:
    use ipfs hash for custodian activation
    broker sends activation fee

  deployment timing:
    add stage PreFunding √
    add startTime √
    add function to start and move to Funding √
      anyone can do it √
      check if after startTime √

  timeouts:
    use timestamp instead of blocks √

  unclaimedPayouts
    need to create unclaimedPayoutTotals like in cpoa √

  how is activation going to work? √
    one step process....
      custodian sends ipfs hash... √
        this is trusted because it is coming from bank √
      fee is deducted from total value √

*/
contract PoaTokenConcept is PausableToken {

  // instance of registry to call other contracts
  Registry private registry;
  // ERC20 name of the token
  string public name;
  // ERC20 symbol
  string public symbol;
  // ipfs hash for proof of custody by custodian
  string public proofOfCustody;
  // fiat currency symbol used to get rate
  string public fiatCurrency;
  // owner of contract, should be PoaManager
  address public owner;
  // broker who is selling property, whitelisted on PoaManager
  address public broker;
  // custodian in charge of taking care of asset and payouts
  address public custodian;
  // ERC0 decimals
  uint256 public constant decimals = 18;
  // ‰ permille NOT percent: fee paid to BBK holders through ACT
  uint256 public constant feeRate = 5;
  // use to calculate when the contract should to Failed stage
  uint256 public creationTime;
  // used to check when contract should move from PreFunding to Funding stage
  uint256 public startTime;
  // amount of seconds until moving to Failed stage after creationTime
  uint256 public timeout;
  // amount needed before moving to pending calculated in fiat
  uint256 public fundingGoal;
  // the total per token payout rate: accumulates as payouts are received
  uint256 public totalPerTokenPayout;
  // used to keep tract of amount funded relative to fundingGoal
  uint256 public fundedAmount;


  // self contained whitelist on contract, must be whitelisted to buy
  mapping (address => bool) public whitelisted;
  // used to deduct already claimed payouts on a per token basis
  mapping(address => uint256) public claimedPerTokenPayouts;
  // fallback for when a transfer happens with payouts remaining
  mapping(address => uint256) public unclaimedPayoutTotals;

  enum Stages {
    PreFunding,
    Funding,
    Pending,
    Failed,
    Active,
    Terminated
  }

  Stages public stage = Stages.PreFunding;

  event StageEvent(Stages stage);
  event BuyEvent(address indexed buyer, uint256 amount);
  event PayoutEvent(uint256 amount);
  event ClaimEvent(uint256 payout);
  event TerminatedEvent();
  event WhitelistedEvent(address indexed account, bool isWhitelisted);
  event ProofOfCustodayUpdated(string ipfsHash);

  modifier eitherCustodianOrOwner() {
    require(
      msg.sender == custodian ||
      msg.sender == owner
    );
    _;
  }

  modifier onlyCustodian() {
    require(msg.sender == custodian);
    _;
  }

  modifier atStage(Stages _stage) {
    require(stage == _stage);
    _;
  }

  modifier atEitherStage(Stages _stage, Stages _orStage) {
    require(stage == _stage || stage == _orStage);
    _;
  }

  modifier isWhitelisted() {
    Whitelist whitelist = Whitelist(
      registry.getContractAddress("Whitelist")
    );
    require(whitelist.whitelisted(msg.sender));
    _;
  }

  modifier checkTimeout() {
    if (stage == Stages.Funding && block.timestamp >= creationTime.add(timeout)) {
      uint256 _unsoldBalance = balances[this];
      balances[this] = 0;
      totalSupply = totalSupply.sub(_unsoldBalance);
      Transfer(this, address(0), balances[this]);
      enterStage(Stages.Failed);
    }
    _;
  }

  // token totalSupply must be more than fundingGoal!
  function PoaTokenConcept
  (
    string _name,
    string _symbol,
    // fiat symbol used in ExchangeRates
    string _fiatCurrency,
    address _broker,
    address _custodian,
    address _registry,
    // given as unix time (seconds since 01.01.1970)
    uint256 _startTime,
    // given as seconds
    uint256 _timeout,
    uint256 _totalSupply,
    // given as fiat cents
    uint256 _fundingGoal
  )
    public
  {
    // ensure all strings are valid
    require(bytes(_name).length >= 3);
    require(bytes(_symbol).length >= 3);
    require(bytes(_fiatCurrency).length >= 3);

    // ensure all addresses given are valid
    require(_broker != address(0));
    require(_custodian != address(0));
    require(_registry != address(0));

    // ensure all uints are valid
    require(_startTime > block.timestamp);
    require(_timeout > 0);
    require(_fundingGoal > 0);
    require(_totalSupply > _fundingGoal);

    // assign strings
    name = _name;
    symbol = _symbol;
    fiatCurrency = _fiatCurrency;

    // assign addresses
    owner = msg.sender;
    broker = _broker;
    custodian = _custodian;
    registry = Registry(_registry);

    // assign uints
    creationTime = block.timestamp;
    startTime = _startTime;
    timeout = _timeout;

    // these uints are supposed to be based off of sqm of building
    totalSupply = _totalSupply;
    fundingGoal = _fundingGoal;
    balances[this] = _totalSupply;

    // start paused
    paused = true;

    // run getRate once in order to see if rate is initialized, throws if not
    ExR(registry.getContractAddress("ExchangeRates"))
      .getRateReadable(_fiatCurrency);
  }

  // start utility functions

  // returns fiat value in cents of given wei amount
  function weiToFiatCents(uint256 _wei)
    public
    view
    returns (uint256)
  {
    // get eth to fiat rate in cents from ExchangeRates
    return _wei
      .mul(
        ExR(registry.getContractAddress("ExchangeRates"))
          .getRateReadable(fiatCurrency)
      )
      .div(1e18);
  }

  function fiatCentsToWei(uint256 _cents)
    public
    view
    returns (uint256)
  {
    return _cents
      .mul(1e18)
      .div(
        ExR(registry.getContractAddress("ExchangeRates"))
          .getRateReadable(fiatCurrency)
      );
  }

  // returns current eth price per token
  function weiPricePerToken()
    public
    view
    returns (uint256)
  {
    return fiatCentsToWei(fundingGoal).div(totalSupply);
  }

  // returns fiat price per token
  function fiatCentPricePerToken()
    public
    view
    returns (uint256)
  {
    return fundingGoal.div(totalSupply);
  }

  // util function to convert wei to tokens. can be used publicly to see
  // what the balance would be for a given Ξ amount.
  // will drop miniscule amounts of wei due to integer division
  function weiToTokens(uint256 _weiAmount)
    public
    view
    returns (uint256)
  {
    return _weiAmount
      .mul(1e18)
      .mul(totalSupply)
      .div(fundingGoal)
      .div(1e18);
  }

  // util function to convert tokens to wei. can be used publicly to see how
  // much Ξ would be received for token reclaim amount
  // will typically lose 1 wei unit of Ξ due to integer division
  function tokensToWei(uint256 _tokenAmount)
    public
    view
    returns (uint256)
  {
    return _tokenAmount
      .mul(1e18)
      .mul(fundingGoal)
      .div(totalSupply)
      .div(1e18);
  }

  // public utility function to allow checking of required fee for a given amount
  function calculateFee(uint256 _value)
    public
    view
    returns (uint256)
  {
    return feeRate.mul(_value).div(1000);
  }

  // pay fee to FeeManager
  function payFee(uint256 _value)
    private
    returns (bool)
  {
    FeeManager feeManager = FeeManager(
      registry.getContractAddress("FeeManager")
    );
    feeManager.payFee.value(_value)();
  }

  // end utility functions

  // pause override
  function unpause()
    public
    onlyOwner
    whenPaused
  {
    // only allow unpausing when in Active stage
    require(stage == Stages.Active);
    return super.unpause();
  }

  // stage related functions
  function enterStage(Stages _stage)
    private
  {
    stage = _stage;
    StageEvent(_stage);
  }

  // start lifecycle functions

  // used to start the sale as long as startTime has passed
  function startSale()
    public
    atStage(Stages.PreFunding)
    returns (bool)
  {
    require(block.timestamp >= startTime);
    enterStage(Stages.Funding);
    return true;
  }

  function buy()
    public
    payable
    checkTimeout
    atStage(Stages.Funding)
    isWhitelisted
    returns (bool)
  {
    uint256 _payAmount;
    uint256 _buyAmount;
    // check if balance has met funding goal to move on to Pending
    if (weiToFiatCents(fundedAmount.add(msg.value)) < fundingGoal) {
      // _payAmount is just value sent
      _payAmount = msg.value;
      // get token amount from wei... drops remainders (keeps wei dust in contract)
      _buyAmount = weiToTokens(_payAmount);
      // check that buyer will indeed receive something after integer division
      // this check cannot be done in other case because it could prevent
      // contract from moving to next stage
      require(_buyAmount > 0);
    } else {
      // let the world know that the token is in Pending Stage
      enterStage(Stages.Pending);
      // set refund amount (overpaid amount)
      uint256 _refundAmount = fundedAmount.add(msg.value).sub(fundingGoal);
      // get actual Ξ amount to buy
      _payAmount = msg.value.sub(_refundAmount);
      // get token amount from wei... drops remainders (keeps wei dust in contract)
      _buyAmount = weiToTokens(_payAmount);
      // assign remaining dust
      uint256 _dust = balances[this].sub(_buyAmount);
      // sub dust from contract
      balances[this] = balances[this].sub(_dust);
      // give dust to owner
      balances[owner] = balances[owner].add(_dust);
      Transfer(this, owner, _dust);
      // SHOULD be ok even with reentrancy because of enterStage(Stages.Pending)
      msg.sender.transfer(_refundAmount);
    }
    // deduct token buy amount balance from contract balance
    balances[this] = balances[this].sub(_buyAmount);
    // add token buy amount to sender's balance
    balances[msg.sender] = balances[msg.sender].add(_buyAmount);
    // increment the funded amount
    fundedAmount = fundedAmount.add(_payAmount);
    // send out event giving info on amount bought as well as claimable dust
    Transfer(this, msg.sender, _buyAmount);
    BuyEvent(msg.sender, _buyAmount);
    return true;
  }

  // used to manually set Stage to Failed when no users have bought any tokens
  // if no buy()s occurred before timeoutBlock token would be stuck in Funding
  function setFailed()
    external
    atStage(Stages.Funding)
    checkTimeout
    returns (bool)
  {
    if (stage == Stages.Funding) {
      revert();
    }
    return true;
  }

  function activate(string _ipfsHash)
    external
    checkTimeout
    onlyCustodian
    atStage(Stages.Pending)
    returns (bool)
  {
    // check that the most common hashing algo is used sha256
    // and that the length is correct. In theory it could be different
    // but use of this functionality is limited to only custodian
    // so this validation should suffice
    require(bytes(_ipfsHash).length == 46);
    require(bytes(_ipfsHash)[0] == 0x51);
    require(bytes(_ipfsHash)[1] == 0x6D);
    // calculate company fee charged for activation
    uint256 _fee = calculateFee(fundingGoal);
    // if activated and fee paid: put in Active stage
    enterStage(Stages.Active);
    // fee sent to FeeManager where fee gets
    // turned into ACT for lockedBBK holders
    require(payFee(_fee));
    proofOfCustody = _ipfsHash;
    // balance of contract (fundingGoal) set to claimable by broker.
    // can now be claimed by broker via claim function
    // should only be buy()s - fee. this ensures buy() dust is cleared
    unclaimedPayoutTotals[broker] = unclaimedPayoutTotals[broker]
      .add(this.balance);
    // allow trading of tokens
    paused = false;
    // let world know that this token can now be traded.
    Unpause();
    // event showing that proofOfCustody has been updated.
    ProofOfCustodayUpdated(_ipfsHash);
    return true;
  }

  // used when property no longer exists etc. allows for winding down via payouts
  // can no longer be traded after function is run
  function terminate()
    external
    eitherCustodianOrOwner
    atStage(Stages.Active)
    returns (bool)
  {
    // set Stage to terminated
    enterStage(Stages.Terminated);
    // pause. Cannot be unpaused now that in Stages.Terminated
    paused = true;
    // let the world know this token is in Terminated Stage
    TerminatedEvent();
  }

  // end lifecycle functions

  // start payout related functions

  // get current payout for perTokenPayout and unclaimed
  function currentPayout(address _address, bool _includeUnclaimed)
    public
    view
    returns (uint256)
  {
    /*
      need to check if there have been no payouts
      safe math will throw otherwise due to dividing 0

      The below variable represents the total payout from the per token rate pattern
      it uses this funky naming pattern in order to differentiate from the unclaimedPayoutTotals
      which means something very different.
    */
    uint256 _totalPerTokenUnclaimedConverted = totalPerTokenPayout == 0
      ? 0
      : balances[_address]
      .mul(totalPerTokenPayout.sub(claimedPerTokenPayouts[_address]))
      .div(1e18);

    /*
    balances may be bumped into unclaimedPayoutTotals in order to
    maintain balance tracking accross token transfers

    perToken payout rates are stored * 1e18 in order to be kept accurate
    perToken payout is / 1e18 at time of usage for actual Ξ balances
    unclaimedPayoutTotals are stored as actual Ξ value
      no need for rate * balance
    */
    return _includeUnclaimed
      ? _totalPerTokenUnclaimedConverted.add(unclaimedPayoutTotals[_address])
      : _totalPerTokenUnclaimedConverted;

  }

  // settle up perToken balances and move into unclaimedPayoutTotals in order
  // to ensure that token transfers will not result in inaccurate balances
  function settleUnclaimedPerTokenPayouts(address _from, address _to)
    private
    returns (bool)
  {
    // add perToken balance to unclaimedPayoutTotals which will not be affected by transfers
    unclaimedPayoutTotals[_from] = unclaimedPayoutTotals[_from].add(currentPayout(_from, false));
    // max out claimedPerTokenPayouts in order to effectively make perToken balance 0
    claimedPerTokenPayouts[_from] = totalPerTokenPayout;
    // same as above for to
    unclaimedPayoutTotals[_to] = unclaimedPayoutTotals[_to].add(currentPayout(_to, false));
    // same as above for to
    claimedPerTokenPayouts[_to] = totalPerTokenPayout;
    return true;
  }

  // reclaim Ξ for sender if fundingGoal is not met within timeoutBlock
  function reclaim()
    external
    checkTimeout
    atStage(Stages.Failed)
    returns (bool)
  {
    // get token balance of user
    uint256 _tokenBalance = balances[msg.sender];
    // ensure that token balance is over 0
    require(_tokenBalance > 0);
    // set token balance to 0 so re reclaims are not possible
    balances[msg.sender] = 0;
    // decrement totalSupply by token amount being reclaimed
    totalSupply = totalSupply.sub(_tokenBalance);
    Transfer(msg.sender, address(0), _tokenBalance);
    // decrement fundedAmount by eth amount converted from token amount being reclaimed
    fundedAmount = fundedAmount.sub(tokensToWei(_tokenBalance));
    // set reclaim total as token value
    uint256 _reclaimTotal = tokensToWei(_tokenBalance);
    // send Ξ back to sender
    msg.sender.transfer(_reclaimTotal);
    return true;
  }

  // send Ξ to contract to be claimed by token holders
  function payout()
    external
    payable
    atEitherStage(Stages.Active, Stages.Terminated)
    onlyCustodian
    returns (bool)
  {
    // calculate fee based on feeRate
    uint256 _fee = calculateFee(msg.value);
    // ensure the value is high enough for a fee to be claimed
    require(_fee > 0);
    // deduct fee from payout
    uint256 _payoutAmount = msg.value.sub(_fee);
    /*
    totalPerTokenPayout is a rate at which to payout based on token balance
    it is stored as * 1e18 in order to keep accuracy
    it is / 1e18 when used relating to actual Ξ values
    */
    totalPerTokenPayout = totalPerTokenPayout
      .add(_payoutAmount
        .mul(1e18)
        .div(totalSupply)
      );

    // take remaining dust and send to owner rather than leave stuck in contract
    // should not be more than a few wei
    uint256 _delta = (_payoutAmount.mul(1e18) % totalSupply).div(1e18);
    // pay fee along with any dust to FeeManager
    payFee(_fee.add(_delta));
    // let the world know that a payout has happened for this token
    PayoutEvent(_payoutAmount);
    return true;
  }

  // claim total Ξ claimable for sender based on token holdings at time of each payout
  function claim()
    external
    atEitherStage(Stages.Active, Stages.Terminated)
    returns (uint256)
  {
    /*
    pass true to currentPayout in order to get both:
      perToken payouts
      unclaimedPayoutTotals
    */
    uint256 _payoutAmount = currentPayout(msg.sender, true);
    // check that there indeed is a pending payout for sender
    require(_payoutAmount > 0);
    // max out per token payout for sender in order to make payouts effectively
    // 0 for sender
    claimedPerTokenPayouts[msg.sender] = totalPerTokenPayout;
    // 0 out unclaimedPayoutTotals for user
    unclaimedPayoutTotals[msg.sender] = 0;
    // let the world know that a payout for sender has been claimed
    ClaimEvent(_payoutAmount);
    // transfer Ξ payable amount to sender
    msg.sender.transfer(_payoutAmount);
    return _payoutAmount;
  }

  // allow ipfs hash to be updated when audit etc occurs
  function updateProofOfCustody(string _ipfsHash)
    external
    atEitherStage(Stages.Active, Stages.Terminated)
    onlyCustodian
    returns (bool)
  {
    proofOfCustody = _ipfsHash;
    ProofOfCustodayUpdated(_ipfsHash);
    return true;
  }

  // end payout related functions

  // start ERC20 overrides

  // same as ERC20 transfer other than settling unclaimed payouts
  function transfer
  (
    address _to,
    uint256 _value
  )
    public
    whenNotPaused
    returns (bool)
  {
    // move perToken payout balance to unclaimedPayoutTotals
    require(settleUnclaimedPerTokenPayouts(msg.sender, _to));
    return super.transfer(_to, _value);
  }

  // same as ERC20 transfer other than settling unclaimed payouts
  function transferFrom
  (
    address _from,
    address _to,
    uint256 _value
  )
    public
    whenNotPaused
    returns (bool)
  {
    // move perToken payout balance to unclaimedPayoutTotals
    require(settleUnclaimedPerTokenPayouts(_from, _to));
    return super.transferFrom(_from, _to, _value);
  }

  // end ERC20 overrides

  // check if there is a way to get around gas issue when no gas limit calculated...
  // fallback function defaulting to buy
  function()
    public
    payable
  {
    revert();
  }
}
