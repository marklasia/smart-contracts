pragma solidity 0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";


// minimal ExchangeRatesProvider definition
contract ExRatesProvider {
  function sendQuery(
    bytes32[5] _queryString,
    uint256 _callInterval,
    uint256 _callbackGasLimit,
    bytes8 _queryType
  )
    public
    payable
    returns (bool)
  {}
}


// minimal BrickblockContractRegistry definition
contract Registry {
  function getContractAddress(string _name)
    public
    view
    returns (address)
  {}
}


/*
Q/A
Q: Why are there two contracts for ExchangeRates?
A: Testing Oraclize seems to be a bit difficult especially considering the
bridge requires node v6... With that in mind, it was decided that the best way
to move forward was to isolate the oraclize functionality and replace with
a stub in order to facilitate effective tests.

Q: Why are there so many crazy string and bytes functions?
A: This is needed in order for the two contracts to talk to each other. Strings
cannot be sent from one contract to another because this cannot be done with
dynamically sized types, which is what a string is in
solidity (dynamic bytes array).

Q: Why are rates private?
A: So that they can be returned through custom getters getRate and
getRateReadable. This is so that we can revert when a rate has not been
initialized or an error happened when fetching. Oraclize returns '' when
erroring which we parse as a uint256 which turns to 0.
*/

// main contract
contract ExchangeRates is Ownable {
  // instance of Registry to be used for getting other contract addresses
  Registry private registry;
  // flag used to tell recursive rate fetching to stop
  bool public ratesActive = true;
  // flag used to clear out each rate interval one by one when fetching rates
  bool public shouldClearRateIntervals = false;
  // used to check on if the contract has self destructed
  bool public isAlive = true;
  // default callback gas limit for recursive functions if none is set
  uint256 public defaultCallbackGasLimit;
  // default callback gas price for recursive functions if none is set
  uint256 public defaultCallbackGasPrice;
  // default call interval for recursive functions if none is set
  uint256 public defaultCallInterval;

  struct Settings {
    bytes32[5] queryString;
    uint256 callInterval;
    uint256 callbackGasLimit;
  }

  // the actual exchange rate for each currency
  // private so that when rate is 0 (error or unset) we can revert through
  // getter functions getRate and getRateReadable
  mapping (bytes8 => uint256) private rates;
  // points to currencySettings from callback
  // is used to validate queryIds from ExchangeRateProvider
  mapping (bytes32 => bytes8) public queryTypes;
  // storage for query settings... modifiable for each currency
  // accessed and used by ExchangeRateProvider
  mapping (bytes8 => Settings) public currencySettings;

  event RateUpdated(string currency, uint256 rate);
  event QueryNoMinBalance();
  event QuerySent(string currency);

  // used to only allow specific contract to call specific functions
  modifier onlyContract(string _contractName)
  {
    require(
      msg.sender == registry.getContractAddress(_contractName)
    );
    _;
  }

  // constructor: sets registry for talking to ExchangeRateProvider
  function ExchangeRates(address _registryAddress)
    public
    payable
  {
    require(_registryAddress != address(0));
    registry = Registry(_registryAddress);
    owner = msg.sender;
  }

  /* this doesn't work with external. I think because it is internally calling
  getCurrencySettings? Though it seems that accessing the struct directly
  doesn't work either */

  // start rate fetching for a specific currency. Kicks off the first of
  // possibly many recursive query calls on ExchangeRateProvider to get rates.
  function fetchRate(string _queryType)
    public
    onlyOwner
    payable
    returns (bool)
  {
    // get the ExchangeRateProvider from registry
    ExRatesProvider provider = ExRatesProvider(
      registry.getContractAddress("ExchangeRateProvider")
    );
    // convert _queryType to uppercase bytes8:
    // cannot use strings to talk to other contracts
    bytes8 _queryTypeBytes = toBytes8(toUpperCase(_queryType));
    // get settings to use in query on ExchangeRateProvider
    uint256 _callInterval;
    uint256 _callbackGasLimit;
    bytes32[5] memory _queryString;
    (
      _callInterval,
      _callbackGasLimit,
      _queryString
    ) = getCurrencySettings(_queryTypeBytes);
    // check that queryString isn't empty before making the query
    require(bytes(toLongString(_queryString)).length > 0);
    // make query on ExchangeRateProvider
    // forward any ether value sent on to ExchangeRateProvider
    require(
      provider.sendQuery.value(msg.value)(
        _queryString,
        _callInterval,
        _callbackGasLimit,
        toBytes8(_queryType)
      )
    );
  }

  // set a pending queryId callable only by ExchangeRateProvider
  // set from sendQuery on ExchangeRateProvider
  // used to check that correct query is being matched to correct values
  function setQueryId(
    bytes32 _queryId,
    bytes8 _queryType
  )
    external
    onlyContract("ExchangeRateProvider")
    returns (bool)
  {
    queryTypes[_queryId] = _queryType;
    return true;
  }

  // called only by ExchangeRateProvider
  // sets the rate for a given currency when query __callback occurs.
  // checks that the queryId returned is correct.
  function setRate(
    bytes32 _queryId,
    uint256 _result
  )
    external
    onlyContract("ExchangeRateProvider")
    returns (bool)
  {
    // get the query type (usd, eur, etc)
    bytes8 _queryType = queryTypes[_queryId];
    // check that first byte of _queryType is not 0 (something wrong or empty)
    // 
    require(_queryType[0] != 0);
    // set _queryId to empty (uninitialized, to prevent from being called again)
    delete queryTypes[_queryId];
    // fetch rate depending on _queryType
    rates[_queryType] = _result;
    // get the settings for a given _queryType
    Settings storage _settings = currencySettings[_queryType];
    // event for particular rate that was updated
    RateUpdated(
      toShortString(_queryType),
      _result
    );

    if (shouldClearRateIntervals) {
      _settings.callInterval = 0;
    }
    return true;
  }

  function setCurrencySettings(
    string _currencyName,
    string _queryString,
    uint256 _callInterval,
    uint256 _callbackGasLimit
  )
    external
    onlyOwner
    returns (bool)
  {
    uint256 _callIntervalValue = _callInterval > 0
      ? _callInterval
      : defaultCallInterval;
    uint256 _callbackGasLimitValue = _callbackGasLimit > 0
      ? _callbackGasLimit
      : defaultCallbackGasLimit;
    currencySettings[toBytes8(toUpperCase(_currencyName))] = Settings(
      toBytes32Array(_queryString),
      _callIntervalValue,
      _callbackGasLimitValue
    );
    return true;
  }

  // for provider
  function getCurrencySettings(bytes8 _queryType)
    public
    view
    returns (uint256, uint256, bytes32[5])
  {
    Settings memory _settings = currencySettings[_queryType];
    return (
      _settings.callInterval,
      _settings.callbackGasLimit,
      _settings.queryString
    );
  }

  // for users
  function getCurrencySettingsReadable(string _queryTypeString)
    external
    view
    returns (uint256, uint256, string)
  {
    Settings memory _settings = currencySettings[
      toBytes8(toUpperCase(_queryTypeString))
    ];
    return (
      _settings.callInterval,
      _settings.callbackGasLimit,
      toLongString(_settings.queryString)
    );
  }

  function getRateReadable(string _queryType)
    external
    view
    returns (uint256)
  {
    uint256 _rate = rates[toBytes8(_queryType)];
    require(_rate > 0);
    return _rate;
  }

  function getRate(bytes8 _queryTypeBytes)
    public
    view
    returns (uint256)
  {
    uint256 _rate = rates[_queryTypeBytes];
    require(_rate > 0);
    return _rate;
  }

  function toggleRatesActive()
    external
    onlyOwner
    returns (bool)
  {
    ratesActive = !ratesActive;
    return true;
  }

  function toggleClearRateIntervals()
    external
    onlyOwner
    returns (bool)
  {
    shouldClearRateIntervals = !shouldClearRateIntervals;
    return true;
  }

  function toBytes8(string _string)
    pure
    public
    returns (bytes8 _convertedBytes8)
  {
    require(bytes(_string).length <= 8);
    assembly {
      _convertedBytes8 := mload(add(_string, 32))
    }
  }

  function toUpperCase(string _base)
    pure
    public
    returns (string)
  {
    bytes memory _stringBytes = bytes(_base);
    for (
      uint _byteCounter = 0;
      _byteCounter < _stringBytes.length;
      _byteCounter++
    ) {
      if (
        _stringBytes[_byteCounter] >= 0x61 &&
        _stringBytes[_byteCounter] <= 0x7A
      ) {
        _stringBytes[_byteCounter] = bytes1(
          uint8(_stringBytes[_byteCounter]) - 32
        );
      }
    }
    return string(_stringBytes);
  }

  // creates a bytes32 array of 5 from string (max length 160)
  // needed for contract communication
  function toBytes32Array(string _string)
    pure
    public
    returns(bytes32[5])
  {
    bytes memory _stringBytes = bytes(_string);
    require(bytes(_stringBytes).length <= 5 * 32);
    uint _bytes32ArrayByteCount = 5 * 32;
    uint _remainingBytes32Bytes;
    uint _bytes32HolderIndex = 0;
    bytes memory _bytes32Holder = new bytes(32);
    string memory _stringSegmentHolder;
    bytes32 _convertedBytes32;
    bytes32[5] memory _bytes32ArrayResult;

    uint _bytes32Counter = 0;
    // loop through each byte in in a bytes32 array with a length of 5
    for (
      uint _byteCounter = 1;
      _byteCounter <= _bytes32ArrayByteCount;
      _byteCounter++
    ) {
      // check to see if a bytes32 block is complete
      _remainingBytes32Bytes = _byteCounter % 32;
      if (_remainingBytes32Bytes == 0) {
        // check to see if we have already written out all string bytes
        if (_byteCounter > _stringBytes.length) {
          _bytes32Holder[_bytes32HolderIndex] = 0x0;
        } else {
          _bytes32Holder[_bytes32HolderIndex] = _stringBytes[_byteCounter - 1];
        }

        _bytes32HolderIndex = 0;
        _stringSegmentHolder = string(_bytes32Holder);

        assembly {
          _convertedBytes32 := mload(add(_stringSegmentHolder, 32))
        }

        _bytes32ArrayResult[_bytes32Counter] = _convertedBytes32;
        _bytes32Counter = _bytes32Counter + 1;
      } else {
        if (_byteCounter > _stringBytes.length) {
          _bytes32Holder[_bytes32HolderIndex] = 0x0;
        } else {
          _bytes32Holder[_bytes32HolderIndex] = _stringBytes[_byteCounter - 1];
        }

        _bytes32HolderIndex = _bytes32HolderIndex + 1;
      }
    }
    return _bytes32ArrayResult;
  }

  function toShortString(bytes8 _data)
    pure
    public
    returns (string)
  {
    bytes memory _bytesString = new bytes(8);
    uint256 _charCount = 0;
    uint256 _bytesCounter;
    uint256 _charCounter;

    for (_bytesCounter = 0; _bytesCounter < 8; _bytesCounter++) {
      bytes1 _char = bytes1(bytes8(uint256(_data) * 2 ** (8 * _bytesCounter)));
      if (_char != 0) {
        _bytesString[_charCount] = _char;
        _charCount++;
      }
    }

    bytes memory _bytesStringTrimmed = new bytes(_charCount);

    for (_charCounter = 0; _charCounter < _charCount; _charCounter++) {
      _bytesStringTrimmed[_charCounter] = _bytesString[_charCounter];
    }

    return string(_bytesStringTrimmed);
  }

  // takes a fixed length array of 5 bytes32. needed for contract communication
  function toLongString(bytes32[5] _data)
    pure
    public
    returns (string)
  {
    require(_data.length == 5);
    bytes memory _bytesString = new bytes(5 * 32);
    uint256 _stringLength;

    for (uint _bytesCounter = 0; _bytesCounter < _data.length; _bytesCounter++) {
      for (uint _stringCounter = 0; _stringCounter < 32; _stringCounter++) {
        byte _char = byte(
          bytes32(
            uint(_data[_bytesCounter]) * 2 ** (8 * _stringCounter)
          )
        );
        if (_char != 0) {
          _bytesString[_stringLength] = _char;
          _stringLength += 1;
        }
      }
    }

    bytes memory _bytesStringTrimmed = new bytes(_stringLength);
    for (_stringCounter = 0; _stringCounter < _stringLength; _stringCounter++) {
      _bytesStringTrimmed[_stringCounter] = _bytesString[_stringCounter];
    }
    return string(_bytesStringTrimmed);
  }

  function selfDestruct()
    onlyOwner
    public
  {
    selfdestruct(owner);
  }

  function()
    payable
    public
  {}
}
