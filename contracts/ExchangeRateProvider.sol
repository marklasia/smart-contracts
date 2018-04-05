pragma solidity 0.4.21;

import "./OraclizeAPI.sol";


contract ExchangeRates {
  // the actual exchange rate for each currency
  mapping (bytes32 => uint256) public rates;
  // points to currencySettings from callback
  mapping (bytes32 => bytes8) public queryTypes;
  // storage for query settings... modifiable for each currency
  mapping (bytes8 => Settings) public  currencySettings;

  mapping (bytes8 => bytes32[5]) public queryStrings;

  struct Settings {
    bytes32[5] queryString;
    uint256 callInterval;
    uint256 callbackGasLimit;
  }

  function setRate(uint256 _rate)
    public
    returns (bool)
  {}
}


contract Registry {
  function getContractAddress(string _name)
    public
    returns (address)
  {}
}


contract ExchangeRateProvider is usingOraclize {
  Registry private registry;

  struct Settings {
    bytes32[5] queryString;
    uint256 callInterval;
    uint256 callbackGasLimit;
  }

  modifier onlyContract(string _contractName)
  {
    require(
      msg.sender == registry.getContractAddress(_contractName)
    );
    _;
  }

  function ExchangeRateProvider(address _registryAddress)
    public
  {
    require(_registryAddress != address(0));
    registry = Registry(_registryAddress);
  }

  function query(
    bytes32[5] _queryString,
    uint256 _callInterval,
    uint256 _callbackGasLimit
  )
    public
    onlyContract("ExchangeRates")
    payable
    returns (bytes32)
  {
    if (oraclize_getPrice("URL") > this.balance) {
      return 0x0;
    } else {
      // make query based on currencySettings for a given _queryType
      bytes32 _queryId = oraclize_query(
        _callInterval,
        "URL",
        toString(_queryString),
        _callbackGasLimit
      );
    }
    return _queryId;
  }

  // callback function to get results of oraclize call
  function __callback(bytes32 _queryId, string _result, bytes _proof)
    public
  {
    // make sure that the caller is oraclize
    require(msg.sender == oraclize_cbAddress());
    ExchangeRates _exchangeRates = ExchangeRates(
      registry.getContractAddress("ExchangeRates")
    );
    bytes32[5] memory _queryString = _exchangeRates.queryStrings(_exchangeRates.queryTypes(_queryId));
    Settings memory _rateSettings = _exchangeRates.currencySettings(_exchangeRates.queryTypes(_queryId));

    bool _ratesActive = _exchangeRates.ratesActive;
    // set rate on ExchangeRates contract
    require(_exchangeRates.setRate(_queryId, parseInt(_result)));
    // check if call interval has been set, if so, call again with the interval
    if (_rateSettings.callInterval > 0 && _ratesActive) {
      query(
        toString(_rateSettings.queryString),
        _rateSettings.callInterval,
        _rateSettings.callbackGasLimit
      );
    }
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
}
