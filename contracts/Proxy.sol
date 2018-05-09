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
      // address is 20 bytes which means that there are going to be extra data here
      let master := and( // bitwise & 
        sload(0x0), // masterContract stored in storage at first pointer already
        0xffffffffffffffffffffffffffffffffffffffff // mask since address is 20 bytes
      )

      // calldatacopy(t, f, s)
      calldatacopy(
        0, // t = mem position to
        0, // f = mem position from
        calldatasize() // s = size bytes
      )

      // delegatecall(g, a, in, insize, out, outsize) => 0 on error 1 on success
      let success := delegatecall(
        not(0), // g = gas ?
        master, // a = address
        0, // in = mem in  mem[in..(in+insize)
        calldatasize(), // insize = mem insize  mem[in..(in+insize)
        0, // out = mem out  mem[out..(out+outsize)
        0 // outsize = mem outsize  mem[out..(out+outsize)
      )

      // returndatacopy(t, f, s)
      returndatacopy(
        0, // t = mem position to
        0,  // f = mem positin from
        returndatasize() // s = size bytes
      )

      if iszero(success) {
        revert(0, returndatasize())
      }
        return(0, returndatasize())
    }
  }
}