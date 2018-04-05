pragma solidity 0.4.18;

import "./OraclizeAPI.sol";


contract ExchangeRates is usingOraclize {
  bool public ratesActive;
  bool public shouldClearRateIntervals;
  address public owner;
  uint256 public defaultCallbackGasLimit;
  uint256 public defaultCallbackGasPrice;
  uint256 public defualtCallInterval;

  // the actual exchange rate for each currency
  mapping (bytes => uint256) rates;
  // points to currencySettings from callback
  mapping (bytes32 => bytes) queryTypes;
  // storage for query settings... modifiable for each currency
  mapping (bytes => Settings) currencySettings;

  struct Settings {
    string currencyName;
    string queryString;
    uint256 callInterval;
    uint256 callbackGasLimit;
  }

  event RateUpdated(string currency, uint256 rate);
  event QueryNoMinBalance();
  event QuerySent(string currency);

  modifier onlyAllowed() {
    require(msg.sender == owner || msg.sender == oraclize_cbAddress());
    _;
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  function ExchangeRates()
    public
    payable
  {}

  // callback function to get results of oraclize call
  function __callback(bytes32 _queryId, string _result, bytes _proof)
    public
  {
    // make sure that the caller is oraclize
    require(msg.sender == oraclize_cbAddress());
    // get the query type (usd, eur, etc)
    bytes _queryType = queryTypes[_queryId];
    // make sure that it is a valid _queryId
    require(_queryType.length > 0);
    // set _queryId to empty (uninitialized, to prevent from being called again)
    delete queryTypes[_queryId];
    // fetch rate depending on _queryType
    rates[_queryType] = parseInt(_result);
    // get the settings for a given _queryType
    Settings memory _settings = currencySettings[_queryType];
    // event for particular rate that was updated
    RateUpdated(
      _settings.currencyName,
      rates[_queryType]
    );
    if (shouldClearRateIntervals) {
      _settings.callInterval = 0;
    }
    // check if call interval has been set, if so, call again with the interval
    if (_settings.callInterval > 0 && ratesActive) {
      fetchRate(_queryType);
    }
  }

  function fetchRate(bytes _queryType)
    public
    onlyAllowed
    payable
    returns (bool)
  {
    // check if contract has balance needed for query
    if (oraclize_getPrice("URL") > this.balance) {
      QueryNoMinBalance();
      return false;
    } else {
      // get the settings for a given _queryType
      Settings memory _settings = currencySettings[_queryType];
      // make query based on currencySettings for a given _queryType
      bytes32 _queryId = oraclize_query(
        _settings.callInterval,
        "URL",
        _settings.queryString,
        _settings.callbackGasLimit
      );
      queryTypes[_queryId] = bytes(_settings.currencyName);
      QuerySent(_settings.currencyName);
    }
    return true;
  }

  function updateRate(
    string _currencyName,
    string _queryString,
    uint256 _callInterval,
    uint256 _callbackGasLimit

  )
    public
    onlyOwner
  {
    currencySettings[bytes(_currencyName)] = Settings(
      _currencyName,
      _queryString,
      _callInterval,
      _callbackGasLimit
    );
  }

  function stopRates()
    public
    onlyOwner
    returns (bool)
  {
    ratesActive = false;
    return true;
  }

  function clearRateIntervals()
    public
    onlyOwner
    returns (bool)
  {
    shouldClearRateIntervals = true;
    return true;
  }

  function selfDestruct()
    public
    onlyOwner
  {
    selfdestruct(owner);
  }

  function()
    public
    payable
  {}
}
