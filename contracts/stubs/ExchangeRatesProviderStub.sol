pragma solidity 0.4.18;


contract ExRates {
  mapping (bytes32 => bytes8) public queryTypes;
  bool public ratesActive;

  function setRate(bytes32 _queryId, uint256 _rate)
    external
    returns (bool)
  {}

  function getCurrencySettings(bytes8 _queryType)
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


contract ExchangeRatesProviderStub {
  Registry private registry;
  // used for testing simulated pending query
  bytes32 public pendingTestQueryId;
  // used to check if should call again when testing recurision
  uint256 public shouldCallAgainIn;
  // used to check callback gas when testing recursion
  uint256 public shouldCallAgainWithGas;
  // used to check queryString when testing recursion
  string public shouldCallAgainWithQuery;

  modifier onlyContract(string _contractName)
  {
    require(
      msg.sender == registry.getContractAddress(_contractName)
    );
    _;
  }

  function ExchangeRatesProviderStub(address _registryAddress)
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
    payable
    onlyContract("ExchangeRates")
    returns (bytes32)
  {
    // simulate price of 2 000 000 000
    uint256 _simulatedPrice = 2e9;
    if (_simulatedPrice > this.balance) {
      return 0x0;
    } else {
      // simulate _queryId by hashing first element of bytes32 array
      pendingTestQueryId = keccak256(_queryString[0]);
      return pendingTestQueryId;
    }
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
    (_callInterval, _callbackGasLimit, _queryString) = _exchangeRates.getCurrencySettings(_queryType);
    // set rate on ExchangeRates contract
    require(_exchangeRates.setRate(_queryId, parseInt(_result)));
    delete pendingTestQueryId;
    // check if call interval has been set, if so, call again with the interval
    if (_callInterval > 0 && _ratesActive) {
      shouldCallAgainWithQuery = toString(_queryString);
      shouldCallAgainIn = _callInterval;
      shouldCallAgainWithGas = _callbackGasLimit;
    } else {
      shouldCallAgainWithQuery = "";
      shouldCallAgainIn = 0;
      shouldCallAgainWithGas = 0;
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
