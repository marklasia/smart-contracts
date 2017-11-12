pragma solidity ^0.4.4;

import './AccessToken.sol';
import './BrickblockToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Fountain is Ownable {

  event TokensLocked(
    address lockedBy,
    uint256 bbtAmount,
    uint256 actAmount,
    uint256 dateLocked,
    uint256 dateUnlocked
    );

  BrickblockToken private brickblockToken;
  AccessToken private accessToken;

  struct LockedBalance {
    uint256 bbtAmount;
    uint256 actAmount;
    uint256 dateLocked;
    uint256 dateUnlocked;
  }

  mapping(address => LockedBalance) public lockedBalances;

  function Fountain() {
    owner = msg.sender;
  }

  function changeBrickblockTokenLocation(address _newAddress)
    onlyOwner
    public
  {
    brickblockToken = BrickblockToken(_newAddress);
  }

  function changeAccessTokenLocation(address _newAddress)
    onlyOwner
    public
  {
    accessToken = AccessToken(_newAddress);
  }

  function lockedBalanceOf(address _address)
    public
    constant
    returns(
      uint bbtAmount,
      uint actAmount,
      uint dateLocked,
      uint dateUnlocked
      )
  {
    // cannot return structs... need to return destructured
    LockedBalance lockedBalance = lockedBalances[_address];
    return (
      lockedBalance.bbtAmount,
      lockedBalance.actAmount,
      lockedBalance.dateLocked,
      lockedBalance.dateUnlocked
      );
  }

  // need to figure out the math on ACT tokens to return
  function calculateReturnRate(address _locker) returns(uint256){
    return 1000;
  }

  // need to find a way to manipulate balances for other token contracts here...
  function lockFunds(
    uint256 _bbtAmount,
    uint256 _dateUnlocked
  )
    public
    returns(bool)
  {
    require(lockedBalances[msg.sender].actAmount == 0);
    require(brickblockToken.allowance(msg.sender, this) >= _bbtAmount);
    require(_dateUnlocked > now);
    // move BBT balance of sender to this contract, requires approval on BBT contract
    brickblockToken.transferFrom(msg.sender, this, _bbtAmount);
    // need to create the math for this a bit later...
    uint256 actAmount = calculateReturnRate(msg.sender);
    // save in variable
    lockedBalances[msg.sender] = LockedBalance(
      _bbtAmount,
      actAmount,
      now,
      _dateUnlocked
      );
    TokensLocked(msg.sender, _bbtAmount, actAmount, now, _dateUnlocked);
    return true;
  }

  function claimFunds() public returns(bool) {
    require(lockedBalances[msg.sender].actAmount != 0);
    // move BBT balance of sender from this contract to sender
    brickblockToken.transfer(msg.sender, lockedBalances[msg.sender].bbtAmount);
    // mint new ACT and send to sender
    accessToken.mint(msg.sender, lockedBalances[msg.sender].actAmount);
    // remove from saved variable
    lockedBalances[msg.sender].actAmount = 0;
  }
}
