pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/MintableToken.sol";
import "./BrickblockUmbrella.sol";


contract BrickblockAccessToken is MintableToken {
  string public constant name = "BrickblockAccessToken";
  string public constant symbol = "ACT";
  uint8 public constant decimals = 18;
  address public fountainAddress;
  address public umbrellaAddress;
  uint256 public totalSupply;
  uint256 public userMinSell;
  uint256 public userMaxSell;
  address public currentSeller;
  address public lastSeller;

  struct SellerData {
    uint256 sellableAmount;
    address next;
  }

  mapping (address => SellerData) sellerQueue;
  mapping (address => uint256) payableBalances;

  event Burn(address indexed burner, uint256 value);
  event Sell(address sell, uint256 value);

  modifier onlyAllowed {
    require(msg.sender == owner || msg.sender == fountainAddress);
    _;
  }

  modifier onlyBurnAuthorized {
    require(umbrellaAddress != address(0));
    BrickblockUmbrella bbu = BrickblockUmbrella(umbrellaAddress);
    require(msg.sender == umbrellaAddress || bbu.tokenStatus(msg.sender));
    _;
  }

  modifier isContract(address addr) {
    uint _size;
    assembly { _size := extcodesize(addr) }
    require(_size > 0);
    _;
  }

  function BrickblockAccessToken
  (
    uint256 _userMinSell,
    uint256 _userMaxSell
  )
    public
  {
    userMinSell = _userMinSell;
    userMaxSell = _userMaxSell;
    currentSeller = msg.sender;
    lastSeller = msg.sender;
    sellerQueue[msg.sender].sellableAmount = 0;
    totalSupply = 0;
  }

  // fountain contract might change over time... need to be able to change it
  function changeFountainAddress(address _newAddress)
    public
    onlyOwner
    isContract(_newAddress)
    returns (bool)
  {
    require(_newAddress != address(0));
    require(_newAddress != fountainAddress);
    require(_newAddress != address(this));
    require(_newAddress != owner);
    fountainAddress = _newAddress;
    return true;
  }

  // fountain contract might change over time... need to be able to change it
  function changeUmbrellaAddress(address _newAddress)
    public
    onlyOwner
    isContract(_newAddress)
    returns (bool)
  {
    require(_newAddress != address(0));
    require(_newAddress != umbrellaAddress);
    require(_newAddress != address(this));
    require(_newAddress != owner);
    umbrellaAddress = _newAddress;
    return true;
  }

  function changeMinSellable(uint256 _amount)
    public
    onlyOwner
    returns (bool)
  {
    userMinSell = _amount;
  }

  function changeMaxSellable(uint256 _amount)
    public
    onlyOwner
    returns (bool)
  {
    userMaxSell = _amount;
  }

  function setNextSeller()
    private
  {
    currentSeller = sellerQueue[currentSeller].next;
  }

  function setLastSeller(address _address)
    private
  {
    uint256 _balance = balances[_address];
    uint256 _sellableAmount = _balance >= userMaxSell ? userMaxSell : _balance;
    sellerQueue[lastSeller].next = _address;
    sellerQueue[_address].sellableAmount = _sellableAmount;
    lastSeller = _address;
  }

  function sellAmount(uint256 _amount)
    private
    returns (uint256)
  {
    sellerQueue[currentSeller].sellableAmount.sub(_amount);
    balances[currentSeller] = balances[currentSeller].sub(_amount);
    totalSupply = totalSupply.sub(_amount);
    payableBalances[currentSeller] = payableBalances[currentSeller].add(_amount);
    Sell(currentSeller, _amount);
    Burn(msg.sender, _amount);
    return balances[currentSeller];
  }

  function sellNext(uint256 _amount)
    private
  {
    uint256 _sellableBalance = sellerQueue[currentSeller].sellableAmount;
    if (_amount >= _sellableBalance) {
      sellAmount(_sellableBalance);
      setNextSeller();
      if (balances[currentSeller] >= userMinSell) {
        setLastSeller(currentSeller);
      }
      sellNext(_amount.sub(_sellableBalance));
    } else {
      sellAmount(_amount);
    }
  }

  function buyTokens()
    public
    payable
  {
    sellNext(msg.value);
  }

  function payableBalanceOf(address _address)
    public
    view
    returns (uint256)
  {
    return payableBalances[_address];
  }

  function claimSales()
    public
  {
    uint256 _payableBalance = payableBalances[msg.sender];
    payableBalances[msg.sender] = 0;
    msg.sender.transfer(_payableBalance);
  }

  function mint
  (
    address _to,
    uint256 _amount
  )
    public
    onlyAllowed
    returns (bool)
  {
    totalSupply = totalSupply.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    if(balances[_to] >= userMinSell) {
      setLastSeller(_to);
    }
    Mint(_to, _amount);
    Transfer(0x0, _to, _amount);
    return true;
  }

  function burnFrom(uint256 _value, address _from)
    onlyBurnAuthorized
    public
    payable
    returns (bool)
  {
    require(_value > 0);
    balances[_from] = balances[_from].sub(_value);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    totalSupply = totalSupply.sub(_value);
    Burn(_from, _value);
    return true;
  }
}
