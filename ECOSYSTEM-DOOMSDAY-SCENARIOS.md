# Ecosystem Doomsday Scenarios
A collection of possible scenarios that may need to be dealt with, along with some assumptions made about the current setup of Brickblocks smart contract ecosystem.


## One of our "DO NOT UPGRADE" contracts have a problem
(ContractRegistry, BrickblockAccount, FeeManager)

### ContractRegistry
All contracts receive the contract registry address during deployment; if we needed to change the registry all contracts would need to be upgraded / re-deployed to call a different registry.

This would be very painful to change; the upside is that this contract is very simple and should not have issues which is why all contracts expect this address not to change.

The owner address of this smart contract is very important, as changing the addresses in the registry can allow for a wide varierty of attacks on the ecosystem.

### BrickblockAccount
This contract holds the company BBK and should not be upgradeable to instill trust in the community. If a security issue was found here then the company tokens could be at risk.

In general this contract will function as intended as long as the ContractRegistry is not compromised.

### FeeManager
This contract holds all ETH paid out as fees. It is not possible to move this ETH other than burning ACT owned by an address.

This would be very painful to change; the upside is that this contract is very simple and should not have issues which is why all contracts expect this address not to change.


## AccessToken Scenarios

### Economics of ACT don't work as expected and need to be changed
This contract technically holds all locked BBK, which means this contract cannot simply be redeployed into some state; luckily there is no ETH stored here and we are only concerned with BBK balances.
- an upgraded version of this contract would need to call the `balanceOf` on its predecessor to get an accurate balance for an address
- as well the `totalSupply_` of the upgrade should be set to the predecessor after being paused
- deploy upgrade
- update `ContractRegistry`


## PoaToken Scenarios

### PoaToken needs to whitelist both senders and receivers of tokens
- there is a flag `whitelistTransfers` which enables checking that both `_to` and `_from` are whitelisted
- fix is to call `toggleWhitelistTransfers`

### A specific PoaToken holder needs to be prevented from selling PoaTokens (but not preventing receiving payouts)
- same as above scenario: must call `toggleWhitelistTransfers` which turns on this check for everyone!
- ensure the address to block is not whitelisted in the `WhitelistContract`

### A specific PoaToken holder needs to be prevented from selling PoaTokens AND receiving payouts
An upgrade to `PoaToken` contract must be done and there are two approaches:

1. update `claimPayouts` to do a similar check as `transfer` and `transferFrom` (this results in POA tokens and ETH payout balance remaining "locked" as long as the address is not whitelisted)
2. the larger fix would be the address that should not receive payouts must have their `PoaToken` balance changed to zero. This would be a large change as it removes all trustlessness properties from PoaToken holders, since *someone* can decide that they are not allowed to hold tokens / receive payouts. If this route is chosen then additional questions arise such as: where do those tokens go, if those tokens are auctioned who get the ETH, where does the balance of payout ETH go, and of course who has the power to perform this action.

### Custodian of a PoaToken loses their private key
- no `onlyCustodian` functions could be called (`activate`, `changeCustodianAddress`, `payout`, `updateProofOfCustody`)
- effectively the `PoaToken` would be stuck; can never be activated (if in a pre-Active stage) and no payouts can occur (since the custodian address cant be changed)
- would need to terminate and redeploy the PoaToken, plus seeding whatever state it is in
- if asset should not be tokenized any more, would need to build `PoaToken` balances by reducing all events `BuyEvent` and `Transfer` in order to do final payout

### PoaToken needs to be upgraded
There is a hack for existing smart contract code / custodian reaches out for help:
- pause the token to prevent transfers
- figure out what the issue is
  * contract has a security flaw, can we upgrade with the Proxy pattern
- if the contract is in a bad state and needs to be rebuilt, continue
- reduce all events for that `PoaToken` to get a mapping of address balances
  * check that the total of tokens matches expected total
  * check that the mapping of addresses to tokens is the same number on live contract
  * notify all exchanges / holders of this PoaToken of the new address
  * terminate old `PoaToken`
  * unpause new `PoaToken`


## WhitelistContract Scenarios

### WhitelistContract needs to be scoped (and not be a global whitelist for all PoaTokens)
- code a new WhitelistContract that checks the `msg.sender` which would be the PoaToken itself as well as the address that is sent in the PoaToken function `checkIsWhitelisted`
- deploy new WhitelistContract
- initialize with desired state of whitelisting
- update ContractRegistry


## ExchangeRates Scenarios

### Do not want to use OraclizeAPI
If this third party service goes out of business / changes fees / we want to use another Oracle (perhaps our own) there are two scenarios to cover:

1. interface expected in ExchangeRates of the ExchangeRateProvider stays the same
2. interface is not the same

#### interface expected in ExchangeRates of the ExchangeRateProvider stays the same
- build and deploy a new `ExchangeRateProvider`
- call `killProvider` on old `ExchangeRate` with an address to receive leftover ETH
- update the `ContractRegistry` with new `ExchangeRateProvider`
- fund new `ExchangeRateProvider` with ETH to fund Oracle callbacks when needed

#### interface is not the same
- build and deploy a new `ExchangeRateProvider` as above
- build and deploy a new `ExchangeRates` contract to use updated interface
- ensure the expected fiat exchange rates are active in new `ExchangeRates`
- update the `ContractRegistry` with new `ExchangeRates`
- call `toggleRatesActive` on old `ExchangeRate`
