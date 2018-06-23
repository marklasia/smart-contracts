pragma solidity 0.4.23;

/* solium-disable security/no-low-level-calls */


contract PoaProxy {
  uint8 public constant version = 1;
  bytes32 public constant proxyPoaTokenSlot = keccak256("PoaTokenMaster");
  bytes32 public constant proxyPoaCrowdsaleSlot = keccak256("PoaCrowdsaleMaster");
  bytes32 public constant proxyRegistrySlot = keccak256("registry");

  event ProxyUpgradedEvent(address upgradedFrom, address upgradedTo);

  constructor(
    address _poaTokenMaster,
    address _poaCrowdsaleMaster,
    address _registry
  )
    public
  {
    require(_poaTokenMaster != address(0));
    require(_poaCrowdsaleMaster != address(0));
    require(_registry != address(0));

    bytes32 _proxyPoaTokenSlot = proxyPoaTokenSlot;
    bytes32 _proxyPoaCrowdsaleSlot = proxyPoaCrowdsaleSlot;
    bytes32 _proxyRegistrySlot = proxyRegistrySlot;

    // all storage locations are pre-calculated using hashes of names
    assembly {
      sstore(_proxyPoaTokenSlot, _poaTokenMaster) // store master token address
      sstore(_proxyPoaCrowdsaleSlot, _poaCrowdsaleMaster) // store master crowdsale address
      sstore(_proxyRegistrySlot, _registry) // store registry address in registry slot
    }
  }

  //
  // start proxy state getters
  //

  function proxyPoaTokenMaster()
    public
    view
    returns (address _poaTokenMaster)
  {
    bytes32 _proxyPoaTokenSlot = proxyPoaTokenSlot;
    assembly {
      _poaTokenMaster := sload(_proxyPoaTokenSlot)
    }
  }

  function proxyPoaCrowdsaleMaster()
    public
    view
    returns (address _masterCrowdsaleContract)
  {
    bytes32 _proxyPoaCrowdsaleSlot = proxyPoaCrowdsaleSlot;
    assembly {
      _masterCrowdsaleContract := sload(_proxyPoaCrowdsaleSlot)
    }
  }

  function proxyRegistry()
    public
    view
    returns (address _proxyRegistry)
  {
    bytes32 _proxyRegistrySlot = proxyRegistrySlot;
    assembly {
      _proxyRegistry := sload(_proxyRegistrySlot)
    }
  }

  //
  // ned proxy state getters
  //

  //
  // start proxy state helpers
  //

  function getContractAddress(
    string _name
  )
    public
    view
    returns (address _contractAddress)
  {
    bytes4 _sig = bytes4(keccak256("getContractAddress32(bytes32)"));
    bytes32 _name32 = keccak256(_name);
    bytes32 _proxyRegistrySlot = proxyRegistrySlot;

    assembly {
      let _call := mload(0x40)          // set _call to free memory pointer
      mstore(_call, _sig)               // store _sig at _call pointer
      mstore(add(_call, 0x04), _name32) // store _name32 at _call offset by 4 bytes for pre-existing _sig

      // staticcall(g, a, in, insize, out, outsize) => 0 on error 1 on success
      let success := staticcall(
        gas,    // g = gas: whatever was passed already
        sload(_proxyRegistrySlot),  // a = address: address in storage
        _call,  // in = mem in  mem[in..(in+insize): set to free memory pointer
        0x24,   // insize = mem insize  mem[in..(in+insize): size of sig (bytes4) + bytes32 = 0x24
        _call,   // out = mem out  mem[out..(out+outsize): output assigned to this storage address
        0x20    // outsize = mem outsize  mem[out..(out+outsize): output should be 32byte slot (address size = 0x14 <  slot size 0x20)
      )

      // revert if not successful
      if iszero(success) {
        revert(0, 0)
      }

      _contractAddress := mload(_call) // assign result to return value
      mstore(0x40, add(_call, 0x24)) // advance free memory pointer by largest _call size
    }
  }

  // ensures that address has code/is contract
  function proxyIsContract(address _address)
    private
    view
    returns (bool)
  {
    uint256 _size;
    assembly { _size := extcodesize(_address) }
    return _size > 0;
  }

  //
  // start proxy state helpers
  //

  //
  // start proxy state setters
  //

  function proxyChangeTokenMaster(address _newMaster)
    public
    returns (bool)
  {
    require(msg.sender == getContractAddress("PoaManager"));
    require(_newMaster != address(0));
    require(proxyPoaTokenMaster() != _newMaster);
    require(proxyIsContract(_newMaster));
    address _oldMaster = proxyPoaTokenMaster();
    bytes32 _proxyPoaTokenSlot = proxyPoaTokenSlot;
    assembly {
      sstore(_proxyPoaTokenSlot, _newMaster)
    }

    emit ProxyUpgradedEvent(_oldMaster, _newMaster);
    getContractAddress("Logger").call(
      bytes4(keccak256("logProxyUpgradedEvent(address,address)")),
      _oldMaster, _newMaster
    );

    return true;
  }

  function proxyChangeCrowdsaleMaster(address _newMaster)
    public
    returns (bool)
  {
    require(msg.sender == getContractAddress("PoaManager"));
    require(_newMaster != address(0));
    require(proxyPoaCrowdsaleMaster() != _newMaster);
    require(proxyIsContract(_newMaster));
    address _oldMaster = proxyPoaCrowdsaleMaster();
    bytes32 _proxyPoaCrowdsaleSlot = proxyPoaCrowdsaleSlot;
    assembly {
      sstore(_proxyPoaCrowdsaleSlot, _newMaster)
    }

    emit ProxyUpgradedEvent(_oldMaster, _newMaster);
    getContractAddress("Logger").call(
      bytes4(keccak256("logProxyUpgradedEvent(address,address)")),
      _oldMaster, _newMaster
    );

    return true;
  }

  //
  // start proxy state setters
  //

  //
  // fallback for all proxied functions
  //

  function()
    external
    payable
  {
    bytes32 _proxyPoaTokenSlot = proxyPoaTokenSlot;
    assembly {
      // load address from first storage pointer
      let _poaTokenMaster := sload(_proxyPoaTokenSlot)

      // calldatacopy(t, f, s)
      calldatacopy(
        0x0, // t = mem position to
        0x0, // f = mem position from
        calldatasize // s = size bytes
      )

      // delegatecall(g, a, in, insize, out, outsize) => 0 on error 1 on success
      let success := delegatecall(
        gas, // g = gas
        _poaTokenMaster, // a = address
        0x0, // in = mem in  mem[in..(in+insize)
        calldatasize, // insize = mem insize  mem[in..(in+insize)
        0x0, // out = mem out  mem[out..(out+outsize)
        0 // outsize = mem outsize  mem[out..(out+outsize)
      )

      // returndatacopy(t, f, s)
      returndatacopy(
        0x0, // t = mem position to
        0x0,  // f = mem position from
        returndatasize // s = size bytes
      )

      // check if call was a success and return if no errors & revert if errors
      if iszero(success) {
        revert(0, 0)
      }
        return(
          0x0,
          returndatasize
        )
    }
  }
}
