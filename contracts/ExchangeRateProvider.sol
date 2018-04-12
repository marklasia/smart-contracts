pragma solidity 0.4.18;

import "./OraclizeAPI.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";


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


contract ExchangeRateProvider is usingOraclize, Ownable {
  Registry private registry;

  modifier onlyAllowed()
  {
    require(
      msg.sender == registry.getContractAddress("ExchangeRates") ||
      msg.sender == oraclize_cbAddress()
    );
    _;
  }

  function ExchangeRateProvider(address _registryAddress)
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
    onlyAllowed
    payable
    public
    returns (bool)
  {
    if (oraclize_getPrice("URL") > this.balance) {
      return false;
    } else {
      // make query based on currencySettings for a given _queryType
      bytes32 _queryId = oraclize_query(
        _callInterval,
        "URL",
        toLongString(_queryString),
        _callbackGasLimit
      );
      setQueryId(_queryId, _queryType);
      return true;
    }
  }

  function setQueryId(bytes32 _identifier, bytes8 _queryType)
    private
    returns (bool)
  {
    ExRates _exchangeRates = ExRates(
      registry.getContractAddress("ExchangeRates")
    );
    _exchangeRates.setQueryId(_identifier, _queryType);
  }

  // callback function to get results of oraclize call
  function __callback(bytes32 _queryId, string _result, bytes _proof)
    public
  {
    // make sure that the caller is oraclize
    require(msg.sender == oraclize_cbAddress());
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
    require(_exchangeRates.setRate(_queryId, parseInt(_result)));

    // check if call interval has been set, if so, call again with the interval
    if (_callInterval > 0 && _ratesActive) {
      sendQuery(
        _queryString,
        _callInterval,
        _callbackGasLimit,
        _queryType
      );
    }
  }

  // takes a fixed length array of 5 bytes32. needed for contract communication
  function toLongString(bytes32[5] _data)
    internal
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
    payable
    public
  {}
}
