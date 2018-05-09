pragma solidity 0.4.23;


contract Proxy {
  address masterContract;

  constructor(address _master) 
    public
  {
    require(_master != address(0));
    masterContract = _master;
  }

  function()
    external
    payable
  {
    assembly {
      // let master := and(sload(0), 0xffffffffffffffffffffffffffffffffffffffff)
      // calldatacopy(0, 0, calldatasize())
      // // g gas
      // // a address
      // // in mem
      // // insize input size mem[in..(in+insize)]
      // // out mem
      // // outsize output size mem[in..(out+outsize)]
      // // returns 0 on error and 1 on success
      // // delegatecall(g, a, in, insize, out, outsize)
      // let success := delegatecall(not(0), master, 0, calldatasize(), 0, 0)
      // // s bytes
      // // t position to
      // // f position from
      // // returndatacopy(t, f, s)
      // returndatacopy(0, 0, returndatasize())

      // if iszero(success) {
      //   return(0, returndatasize())
      // }

      // revert(0, returndatasize())

      let masterCopy := and(sload(0), 0xffffffffffffffffffffffffffffffffffffffff)
      calldatacopy(0, 0, calldatasize())
      let success := delegatecall(not(0), masterCopy, 0, calldatasize(), 0, 0)
      returndatacopy(0, 0, returndatasize())
      switch success
      case 0 { revert(0, returndatasize()) }
      default { return(0, returndatasize()) }
    }
  }
}