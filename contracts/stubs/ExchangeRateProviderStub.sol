pragma solidity 0.4.18;


contract ExRates {
  mapping (bytes32 => bytes8) public queryTypes;
  bool public ratesActive;

  function setRate(bytes32 _queryId, uint256 _rate)
    external
    returns (bool)
  {}

  function setQueryId(
    bytes32 _queryId,
    bytes8 _queryType
  )
    external
    returns (bool)
  {}

  function getCurrencySettings(bytes8 _queryType)
    view
    external
    returns (uint256, uint256, bytes32[5])
  {}
}


contract Registry {
  function getContractAddress(string _name)
    public
    view
    returns (address)
  {}
}


contract ExchangeRateProviderStub {
  Registry private registry;
  // used for testing simulated pending query
  bytes32 public pendingTestQueryId;
  // used for tetsing simulated testing recursion
  bytes8 public pendingQueryType;
  // used to check if should call again when testing recurision
  uint256 public shouldCallAgainIn;
  // used to check callback gas when testing recursion
  uint256 public shouldCallAgainWithGas;
  // used to check queryString when testing recursion
  string public shouldCallAgainWithQuery;

  modifier onlyAllowed()
  {
    address _exchangeRates = registry.getContractAddress("ExchangeRates");
    address _this = address(this);
    require(
      msg.sender == _exchangeRates || msg.sender == _this
    );
    _;
  }

  function ExchangeRateProviderStub(address _registryAddress)
    public
  {
    require(_registryAddress != address(0));
    registry = Registry(_registryAddress);
  }

  function sendQuery(
    bytes32[5] _queryString,
    uint256 _callInterval,
    uint256 _callbackGasLimit,
    bytes8 _queryType
  )
    public
    payable
    onlyAllowed
    returns (bool)
  {
    // simulate price of 2 000 000 000
    uint256 _simulatedPrice = 2e9;
    if (_simulatedPrice > this.balance) {
      return false;
    } else {
      // simulate _queryId by hashing first element of bytes32 array
      pendingTestQueryId = keccak256(_queryString[0]);
      setQueryId(pendingTestQueryId, _queryType);
      return true;
    }
  }

  // needed to manually set queryId/queryType when testing...
  // run after a callback where recursion is expected
  function setQueryId(bytes32 _identifier, bytes8 _queryType)
    public
    returns (bool)
  {
    ExRates _exchangeRates = ExRates(
      registry.getContractAddress("ExchangeRates")
    );
    pendingTestQueryId = _identifier;
    _exchangeRates.setQueryId(_identifier, _queryType);
  }

  // callback function to get results of oraclize call
  function simulate__callback(bytes32 _queryId, string _result)
    public
  {
    // make sure that the caller is oraclize
    ExRates _exchangeRates = ExRates(
      registry.getContractAddress("ExchangeRates")
    );

    bool _ratesActive = _exchangeRates.ratesActive();
    bytes8 _queryType = _exchangeRates.queryTypes(_queryId);
    uint256 _callInterval;
    uint256 _callbackGasLimit;
    bytes32[5] memory _queryString;
    (
      _callInterval,
      _callbackGasLimit,
      _queryString
    ) = _exchangeRates.getCurrencySettings(_queryType);

    // set rate on ExchangeRates contract
    _exchangeRates.setRate(_queryId, parseInt(_result));

    if (_callInterval > 0 && _ratesActive) {
      pendingTestQueryId = keccak256(_result);
      pendingQueryType = _queryType;
      shouldCallAgainWithQuery = toLongString(_queryString);
      shouldCallAgainIn = _callInterval;
      shouldCallAgainWithGas = _callbackGasLimit;
    } else {
      delete pendingTestQueryId;
      delete pendingQueryType;
      shouldCallAgainWithQuery = "";
      shouldCallAgainIn = 0;
      shouldCallAgainWithGas = 0;
    }
  }

  // takes a fixed length array of 5 bytes32. needed for contract communication
  function toLongString(bytes32[5] _data)
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

  // taken from oraclize in order to parseInts during testing
  // parseInt
  function parseInt(string _a)
    internal
    pure
    returns (uint)
  {
    return parseInt(_a, 0);
  }

  // parseInt(parseFloat*10^_b)
  function parseInt(string _a, uint _b)
    internal
    pure
    returns (uint)
  {
    bytes memory bresult = bytes(_a);
    uint mint = 0;
    bool decimals = false;
    for (uint i = 0; i < bresult.length; i++) {
      if ((bresult[i] >= 48) && (bresult[i] <= 57)) {
        if (decimals) {
          if (_b == 0)
            break;
          else
            _b--;
        }
        mint *= 10;
        mint += uint(bresult[i]) - 48;
      } else if (bresult[i] == 46)
        decimals = true;
    }
    if (_b > 0)
      mint *= 10 ** _b;
    return mint;
  }
}
