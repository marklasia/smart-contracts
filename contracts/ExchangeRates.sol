pragma solidity 0.4.18;

import "./OraclizeAPI.sol";


contract ExchangeRateProvider {
  function query(
    bytes32[5] _queryString,
    uint256 _callInterval,
    uint256 _callbackGasLimit
  )
    public
    returns (bytes32)
  {}
}


contract Registry {
  function getContractAddress(string _name)
    public
    returns (address)
  {}
}


contract ExchangeRates is usingOraclize {
  Registry private registry;
  bool public ratesActive;
  bool public shouldClearRateIntervals;
  address public owner;
  uint256 public defaultCallbackGasLimit;
  uint256 public defaultCallbackGasPrice;
  uint256 public defaultCallInterval;

  // the actual exchange rate for each currency
  mapping (bytes32 => uint256) public rates;
  // points to currencySettings from callback
  mapping (bytes32 => bytes8) public queryTypes;
  // storage for query settings... modifiable for each currency
  mapping (bytes8 => Settings) public currencySettings;

  struct Settings {
    bytes32[5] queryString;
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

  modifier onlyContract(string _contractName)
  {
    require(
      msg.sender == registry.getContractAddress(_contractName)
    );
    _;
  }

  function ExchangeRates(address _registryAddress)
    public
    payable
  {
    require(_registryAddress != address(0));
    registry = Registry(_registryAddress);
  }

  function fetchRate(string _queryType)
    public
    onlyAllowed
    payable
    returns (bool)
  {
    // get the oraclize provider from registry
    ExchangeRateProvider provider = ExchangeRateProvider(
      registry.getContractAddress("ExchangeRatesProvider")
    );
    // get settings to use in query to provider
    Settings memory _settings = currencySettings[stringToBytes8(_queryType)];
    // make query on provider contract
    bytes32 _queryId = provider.query(
      _settings.queryString,
      _settings.callInterval,
      _settings.callbackGasLimit
    );

    if (_queryId.length == 0) {
      QueryNoMinBalance();
      return false;
    } else {
      queryTypes[_queryId] = stringToBytes8(_queryType);
      QuerySent(_queryType);
      return true;
    }
  }

  function setRate(
    bytes32 _queryId,
    uint256 _result
  )
    public
    onlyContract("ExchangeRatesProvider")
    returns (bool)
  {
    // get the query type (usd, eur, etc)
    bytes8 _queryType = queryTypes[_queryId];
    // make sure that it is a valid _queryId
    require(_queryType.length > 0);
    // set _queryId to empty (uninitialized, to prevent from being called again)
    delete queryTypes[_queryId];
    // fetch rate depending on _queryType
    rates[_queryType] = _result;
    // get the settings for a given _queryType
    Settings memory _settings = currencySettings[_queryType];
    // event for particular rate that was updated
    /*
    TODO: make yet another string conversion function...
     RateUpdated(
      _settings.currencyName,
      rates[_queryType]
    );
    */
    if (shouldClearRateIntervals) {
      _settings.callInterval = 0;
    }
    return true;
  }

  function setRateSettings(
    string _currencyName,
    string _queryString,
    uint256 _callInterval,
    uint256 _callbackGasLimit

  )
    public
    onlyOwner
  {
    require(
      bytes(_currencyName).length > 0 &&
      bytes(_currencyName).length < 8
    );
    uint256 _callIntervalValue = _callInterval > 0
      ? _callInterval
      : defaultCallInterval;
    uint256 _callbackGasLimitValue = _callbackGasLimit > 0
      ? _callbackGasLimit
      : defaultCallbackGasLimit;
    currencySettings[stringToBytes8(_currencyName)] = Settings(
      toBytes32(_queryString),
      _callIntervalValue,
      _callbackGasLimitValue
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

  function stringToBytes8(string _string)
    pure
    private
    returns (bytes8 _convertedBytes8)
  {
    assembly {
      _convertedBytes8 := mload(add(_convertedBytes8, 8))
    }
  }

  // creates a bytes32 array of 5 from string (max length 160)
  // needed for contract communication
  function toBytes32(string _string)
    pure
    public
    returns(bytes32[5])
  {
    bytes memory _stringBytes = bytes(_string);
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

  // takes a fixed length array of 5 bytes32. needed for contract communication
  function toString(bytes32[5] _data)
    public
    pure
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
