pragma solidity 0.4.18;


contract BrickblockContractRegistry {

 address public owner;
 mapping (bytes => address) contractAddresses;

 modifier onlyOwner() {
   require(msg.sender == owner);
   _;
 }

 function BrickblockContractRegistry()
   public
 {
   owner = msg.sender;
 }

 function updateContract(string _name, address _address)
   public
   onlyOwner
 {
   contractAddresses[bytes(_name)] = _address;
 }

 function getContractAddress(string _name)
   public
   view
   returns (address)
 {
   return contractAddresses[bytes(_name)];
 }


}
