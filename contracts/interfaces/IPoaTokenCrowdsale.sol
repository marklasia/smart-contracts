pragma solidity 0.4.23;

// this is meant to be a combined interface of PoaToken and PoaCrowdsale
// the resulting ABI can be used for calling both PoaToken and PoaCrowdsale functions
interface IPoaTokenCrowdsale {
  function proxyPoaTokenMaster()
    external
    view
    returns (address _poaTokenMaster);

  function proxyPoaCrowdsaleMaster()
    external
    view
    returns (address _masterCrowdsaleContract);

  function poaCrowdsaleMaster()
    public
    view
    returns (address _poaCrowdsaleMaster);
} 