# Brickblock Smart Contracts
These are all of the smart contracts which power the Brickblock ecosystem.

## Installing
1. Install dependencies using:

    ```sh
    yarn
    ```

1. Install [mythril](https://github.com/ConsenSys/mythril), a security analysis tool for Ethereum smart contracts

    ```sh
    # You will need python3 and pip3 for this to work
    pip3 install mythril
    ```

## Testing
Main tests can be run using:
```sh
yarn test
```

Stress test can be run using:
```sh
yarn test:stress-tests
```

Frozen contracts (`BrickblockToken` & `CustomPOAToken`) can be tested using:
```sh
yarn test:frozen
```

## Security Analysis
Mythril can be run in order to check for vulnerabilities:
```sh
yarn test:mythril
```

## Linting
Linting both js and sol files can be done using:
```
yarn lint
```

`.sol` only:
```
yarn lint:sol
```

`.js` only:
```
yarn lint:js
```

## Deployment
Mainnet deployment is done through offline signing of transactions. But testnet deployments can be done through truffle.

TODO: add instructions for deployment to testnet once migration file is done!

## General Overview

The ecosystem is powered by 13 different contracts. 1 additional contract is a standalone contract which is meant to be an early stage proof of concept which does not rely on the rest of the ecosystem.

Ecosystem Contracts:
1. `ContractRegistry`
1. `BrickblockToken`
1. `AccessToken`
1. `FeeManager`
1. `Whitelist`
1. `ExchangeRates`
1. `ExchangeRateProvider`
1. `OraclizeAPI`
1. `CentralLogger`
1. `PoaManager`
1. `Proxy`
1. `PoaToken`
1. `BrickblockAccount`

Standalone Contract:
1. `CustomPoaToken`

[Brickblock Ecosystem Chart](https://www.draw.io/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=Untitled%20Diagram.xml#R7Vzfc5s4EP5r%2FJgMSObXo%2B02vZu7znnazrV9VLCMmWDkA5w4%2FetPAgmDJBpsA3Y7%2BCVmJYTQftpvtbvOBC62hw8J2m0%2BkhWOJsBYHSbw3QQAcwoN%2BodJXguJA6eFIEjCFe90FHwOf2Au5PcF%2B3CF01rHjJAoC3d1oU%2FiGPtZTYaShLzUu61JVH%2FqDgVYEXz2UaRKv4arbMOlpmEcG%2F7AYbDhj3Yt3vCI%2FKcgIfuYP28C4Dr%2FFM1bJMbi%2FdMNWpGXigi%2Bn8BFQkhWfNseFjhiayuWrbjvoaG1nHeC46zVDRhB03E8YwV85Lnwjo%2FwjKI9X4uZ7%2BM0%2FUKecDwBdkSHnT8mbOrZK18u%2B789m%2B98TeLsLs2VOaMdTLCjgJgf2%2Bm3oPgLavcDOieqWXoxf9mEGf68Qz5reaHgorJNto3olUm%2F5iuL2dwNelUuHmvyyTb0eUOEHnE0L1WxIBFJaFNMYvaMNEvoywgh1ZCRf8oWoXE26jqMokrPh%2FzDX%2FUBbcOIAfxfnKxQjLiYo9kE%2FFr3IBSFQUxlPlUTTsolqepNKAInGT5URFyPHzDZ4ix5pV14KxQY5HvOcvn1yxHBHhdtKth1uAzxPROUIx9xQ79w6LSEka3ASGAn3aH4IvR8ZRCJwjQTI9LJFYOO6OoPXVPbqqHL9iwFXaV5rMLL7gNeTn%2FwWpLZCKwBgWXDt82WFli92C1XAdaSoI90lQL6vqP%2Be9C%2FByT9O869aloGIy5PAcADxiMAegSAZdyQ3yIOIH0wyzwJ%2FafHiPhP1KWm%2Bh0dmCFhZk5lmAGNnTGBzoWx%2BkCaetLqDGnvD%2F4GxQH%2BhDJ6ih5RNqA3A0pUlY6yxp8xrZ4cZR2oZD3HqxkLkbA3j1CaMoXRRUdJpoorWseHMPvGVEvfr7j6LlpiOstKE7v8zkHQUkWNK5%2BSfeKLoEzDKYBOPcBZQx%2BxInhVi%2FioCqyox9LYACFLcISy8LkeJ9KpjD9hSUJm6Et8NJGdGKJ4YX5XNXAjDeTY9YFsUzJSxaooA%2BUIKl%2B7HaiA6hOFiM1F2Bn6lZsaCWt012SS8cDUfqHHvAMDyI5NMJ%2ByNZ9Y73Tbku2%2B0EfRjDdsw9WK3d9kYY4xt0vw17T1y6Ajf4lJNXCnMwnGvWFMzZqy7kAnYLK0g4r7yXqd4ot1b%2FXtD%2BUOUS26OBLVAEQFoUxUDtQQFdARVRfukC5A2BFRlXRUI6OStr5VCE1QWK80Jc4UNZ6yboqW3DqZTI0zWcmUgjllTLoHVlJjgFvyzKhoQbbUfLDFm8%2F%2F%2Bp0oSeyZLijJ8WqKMi%2BDUbecowbhGEfQ2%2FZx8YW%2B789UPJDhKFo2JAl%2FUN2haAiXV2tLGnJ4N2pbXIk%2BzrUtU9ibxyvIqGpbirnMFl%2FawU13cqpip4o3czLkqcn75RAE5MymdyY9Aavuh1sW7A1CUIEQBUe4paI11pyU3gSR1jiZDaapf5%2BmBYi8mwLRnRT%2Fc8C5Po508Jbj0B1iaKpgaIdez0aQzgwdIzaqIdLTW6Prc%2FVQz4i3S%2FGmHvb9Dc4drhdRdEGP0127Wwr9yRDLyO4W8GWP%2BLoQX%2Bqh308wytihbZeQw%2BuSoAuYsY316hVErgoi2PacL7Rq3JuG4dY0Isj2Orhy4Zm48qSBbNDO2aLKzklOdOPHce2jOj13AjWiIJ87ezltDpw10blutxWNurM6giCUi9bkbEuHtk0tHOklnbtMyHO4YrUoY7D8lGC5JmimbJzmrK5RPzc6upyu5aoboosaFQH%2BPpD1T4L8iHabLf8cAXVFQHnGkIDqsUiggdROjkdITPQmy4FWUa2rsprlyBk399w0i1pl4vSXaJmq9mdXkBBbb8KUdSwDSIoyAJaQyKhtyRRg%2FVrpl9apljpA4c93v3Fv2LZT05%2Fwym4iAQOBonE6LtVxyNhmXdR%2B7JLQz1VNYt7SvwnR1yCd7DGfalwEA1eNS2FwrlZG5Eke8tmWRBrI6e%2F0D9WIeGd%2BzILBBEV%2FkyAYXeNBPRlXKmjTljv29fMNqAYslyyONP5O8YYR40gJ4SHr%2FaEa4tmnzG%2FJf%2FVFuZ05NR3zmCYs2ZyKuSxgeTKxWSqx6UPjVysekKv2p2dWDzhStaQtM2aHRKfWr3RHdPs0I9slQZ2ZuJErB7N8ENYx6BmD%2FgQFqiHKiATMbDxjEWG%2FvCTh54WWHaT2TjVybXJ9hW96w1kZ04Csjty2TcNxHdcz7Lo1A%2FDe8DzPNF3LNm1TyrS0TtnIRhK0K7G6WspmqoayFjzy8AkHYSp2SBXWRwtlvm3OLo0WtDcO5bYX5W22xi3SmobT%2FSJ6efwXI8WyH%2F%2BPC3z%2FPw%3D%3D)

Version numbers are used for each contract. They are set as `uint8 public constant`s

Interfaces are always prefixed with an `I`. Example: `IPoaManager`. Interfaces can all be found in `contracts/interfaces/`

## ContractRegistry
`ContractRegistry` is a rather simple yet integral part of the ecosystem. It allows all of the other contracts to talk to each other in the ecosystem. It also allows for swapping out non-`PoaToken` contracts for newer versions. This will allow for the smart contracts to evolve and improve over time along with the needs of the project.

It uses a single private mapping which maps `bytes32` to addresses. A given `string` converted to bytes32 by hashing the string using `keccak256` will return a corresponding address.

There are several getters: one allows usage of `string`s and the other allows direct usage of `bytes32` (useful for some required assembly in other contracts).

There is a single setter which is restricted using OpenZeppelin's `Ownable` contract.

## BrickblockToken
BrickblockToken is an ERC20 `PausableToken` (from OpenZeppelin) with added features enabling the Brickblock contract to:

* send out tokens from the token sale
* finalise the token sale according to previously agreed up terms
* approve the `BrickblockAccount` contract to transfer company tokens
* change the stored address for the fountain contract
* be tradable amongst users
* be tradable on exchanges
* be pausable

Finalize token sale is the most noteworthy function which finalizes balances once when the token sale has finished. There are three main groups where percentages are allocated:
1. `contributorsShare`
    * 51%
1. `companyTokens`
    * 35%
1. `bonusTokens`
    * 14%

When the sale is finalized, any unsold tokens are burnt from the `contributorsShare`. 

Company tokens are held as the contract's token balance (`balanceOf(address(this))`). When finalize is called it sets approval for a given contract to run `trasnferFrom`. The contract to get this approval `BrickblockAccount`.

Company tokens can be used like other users' tokens other than being able to move tokens outside of the ecosystem until November 30, 2020. More details on these functions will be covered in the `BrickblockAccount` section.

The `AccessToken` contract will later be called to lock the company funds into the fountain. See below for more details. This is the same process for any other users wanting to benefit from `BrickblockToken` ownership.

### Important Notes
#### BrickblockFountain
In early development there was a contract called `BrickblockFountain`. The address value on the current `BrickblockToken` on mainnet is `fountainContractAddress`. This is actually the `BrickblockAccount` contract. Concepts and methods of handling company tokens have changed since deployment of the `BrickblockToken` contract. The end result is exactly the same as originally intended. Only the execution and variable names are different.

#### Original Intentions
`BrickblockAccount` was essentially meant to be part of the functionality of `AccessToken`. It was later found to be a better idea to seperate these contracts for clarity and cleaner code.

#### Cosmetic Toggle
There is also a `toggleDead` function which does not do anything other than set a cosmentic `bool` variable. It is only meant to be a flag to set should the worst happen...

## AccessToken
### General Overview
`AccessToken` (ACT) is an ERC20 compliant token which is redeemable for ether at a 1000ACT:1ETH ratio. This redemption happens on the `FeeManager` contract (explained more in `FeeManager` contract). ACT can only be aquired through locking in `BrickblockToken`s (BBK).

Locking in BBK is means:

*transferring a given amount of BBK to the `AccessToken` contract through the `lockBBK()` function. Transferred balances are essentially owned by the `AccessToken` contract at this point. A record of the sender's balance is kept in order to redeem (unlock) at any given time after locking.*

Unlocking BBK means:

*calling the `AccessToken` contract function `unlockBBK()` with a given amount that is less than or equal to originally locked balance. This will return the given amount of tokens to the original owners control.*

Every time a fee is paid in the ecosystem, ACT is distributed through the `AccessToken` contract by `FeeManager`. Only `FeeManagr` can distribute ACT and only addresses which have locked in BBK before the fee payment receive ACT. If a user's BBK are not locked they do not get any ACT.

Locking tokens will put the user into the distribution pool for ACT when they are distributed during fee payments that arise in the ecosystem. Tokens must be locked before a fee is paid in the ecosystem in order to receive ACT during the given distribution.

The amount of ACT a user gets is a proportion of user locked BBK to total locked BBK. Ether is redeemed for ACT through the `FeeManager` contract which burns the given amount of ACT on your behalf for ETH.

### Technical
There are a few key concepts here that need to be explained in order to fully understand the `AccessToken` contract.

#### Locking & Unlocking BBK
This was mostly covered above... but there are a few things worth mentioning. In order to `lockBBK()`, a user must `approve()` the `AccessToken` for at least the amount the user wants to lock. The user must then call `lockBBK()` AFTER the `allowance` has been set. `lockBBK()` essentially is just running a `transferFrom()` on the `BrickblockToken` contract (along with recording ownership in `lockedBBK`).

`unlockBBK()` simply transfers the given amount back.

Using [ERC223](https://github.com/Dexaran/ERC223-token-standard) would have been great here. But it was not known about at the time of deploying `BrickblockToken`.

#### ACT distributions
There is a somewhat unique way of handling dividends in this contract. 

Imagine that there are 5 BBK tokens locked into the contract; you own 2 of the 5 locked in. Now imagine that there are 10 ACT tokens being distributed to the contract. What `AccessToken` does is simply take the amount and divide that by the total locked tokens (5). This will result in 2. This is `uint256 totalMintedPerToken` in the contract. You would be entitled to 4 ACT at this point.

```js
// js pseudo code
const yourLockedBBk = 2
const totalMintedPerToken = 10ACT / 5BBK = 2
const yourBalance = totalMintedPerToken * yourLockedBBK = 4
```

Now what happens if there are multiple distributions? Perhaps another distribution of 10 ACT? `totalMintedPerToken` is now 4

```js
// js pseudo code
const yourLockedBBk = 2
const totalMintedPerToken = 10ACT / 5BBK = 2
const yourBalance = totalMintedPerToken * yourLockedBBK = 4
// distribution 2
const yourLockedBBk = 2
const totalMintedPerToken = (10 + 10)ACT / 5BBK = 4
const yourBalance = totalMintedPerToken * yourLockedBBK = 8
```

But what happens if you want to claim some of these tokens and move them? We need to account for that. That is what `distributedPerBBK` handles. We deduct the distributed amount per user in order to get the real amount of ACT readily available. When a user transfers or redeems ACT.

```js
// js pseudo code
const yourLockedBBk = 2
const totalMintedPerToken = 20ACT / 5BBK = 2
const yourBalance = totalMintedPerToken * yourLockedBBK = 4
// transfer redeem for ether
const yourLockedBBk = 2
const totalMintedPerToken = 20ACT / 5BBK = 2
const distributedPerBBK = 6
const yourBalance = (totalMintedPerToken * yourLockedBBK) - distributedPerBBK = 2
```

There is one last piece to the puzzle that is missing. What happens when you transfer BBK to another address? Won't you have an inaccurate balance when its based on tokens? We handle that by setting a user's `distributedPerBBK` to max and using another variable to store the rest the balance that was there before the transfer. This is done for both the receiver and the sender. This is called `securedTokenDistributions` in the `AccessToken` contract.
```js
// js pseudo code
const yourLockedBBk = 2
const totalMintedPerToken = 20ACT / 5BBK = 2
const yourBalance = totalMintedPerToken * yourLockedBBK = 4
// transfer redeem for ether
const yourLockedBBk = 2
const totalMintedPerToken = 20ACT / 5BBK = 2
const distributedPerBBK = 6
const yourBalance = (totalMintedPerToken * yourLockedBBK) - distributedPerBBK = 2
// transfer 6 ACT token away
const yourLockedBBk = 2
const totalMintedPerToken = 20ACT / 5BBK = 2
const distributedPerBBK = 20ACT
const securedTokenDistributions = (totalMintedPerToken * yourLockedBBK) - distributedPerBBK = 2
const yourBalance = (totalMintedPerToken * yourLockedBBK) - distributedPerBBK + securedTokenDistributions = 2
```

For further reading please see the commented glossary at the top of the `AccessToken.sol` file.

#### `balanceOf()` Override & Additional ERC20 Overrides
It is almost never a great idea to run a huge for loop in solidity. But we need a way to distribute all of these access tokens to locked BBK holders. How is that done? Enter balanceOf as an algorithm.

The easiest way to understand this is through a more pure version of this concept. [NoobCoin](https://github.com/TovarishFin/NoobCoin) is a project which implements this and only this. It is a good starting point for understanding this concept.

Essentially what is happening here is that instead of just giving back a number, we are giving a starting balance plus received amounts minus sent amounts. What this boils down to in `AccessToken` is the ACT distribution value mentioned in the section above plus received balances minus sent balances.
```sol
// pseudo code

// how much BBK you have locked in
totalMintedPerToken = lockedBBK[_address]
    // multiplying by totalPerToken and deducting by
    .mul(totalMintedPerToken.sub(distributedPerBBK[_address])) 
    // variable that holds any balances bumped during transfers
    .add(securedTokenDistributions[_address])
    // deduct anything you spent (from transfers/transferFroms)
    .add(receivedBalances[_address])
    // add anythinng you received (from transfers/transferFroms)
    .sub(spentBalances[_address]); 
```

With this algorithm we can distribute ACT to users without actually distributing. Using this means that we need to make the `balances` mapping private in the ERC20 standard in order to ensure that the correct balances are being returned rather than the `balances` mapping which is no longer accurate or used. `transfer` and `transferFrom` are modified to use `balanceOf()` function rather than `balances` mapping.

#### Ether redemption for ACT
Ether redemption is done through the `FeeManager` contract which has the power to `burn` a given users balances. When `burn`ed, `AccessToken` simply increments the `spentBalances` of the user and decrements the totalSupply.

#### TLDR
There is `AccessToken` allows for locking BBK through `transferFrom` and allows distributions of ACT to be triggered from `FeeManager`. Distributions are handled through manipulating the `balanceOf()` function as well as some neat dividend tricks. ETH redemption is done through burning ACT on the `FeeManager` contract.

## FeeManager
`FeeManager` is the link between `PoaToken`s where fees are paid and `AccessToken` where the actual fee is distributed in ACT.

It has only two main functions and two supporting utility functions. It does not store anything other than the location of the `ContractRegistry`.

### `payFee()`
`payFee()` is a payable function which calls the `AccessToken` contract to `distribute()` which mints and distributes ACT at a ratio corresponding to the ACT:WEI rate:
*1e3ACT: 1ETH = 1e3ACT: 1E18ETH*

This is how locked BBK holders receive ACT.

This function can be called by anyone. Meaning anyone can pay a fee if they really wanted to. For the purposes of the ecosystem, it is used by `PoaTokens` when a fee must be paid. 

Ether is held on this contract which can be redeemed later using `claimFee()`.

### `claimFee()`
`claimFee()` can be called by a user with a given amount of ACT to claim. The claim amount must be equal to or less than the user's ACT balance. Ether is sent to the user based on the ACT:WEI rate (1000: 1e18). The ACT tokens used to claim are burnt using the `AccessToken` `burn()` function. Only `FeeManager` can call `burn()`.

### Utility functions
There are several utility functions which simply retrieve the currennt ACT:WEI rate from the `ExchangeRates` contract. This will be covered in more detail in the `ExchangeRates` contract. The ACT:WEI rate is taken from `ExchangeRates` in case the rate needs to change. At the time of writing this it has been decided that the rate is 1000ACT:1ETH. Though this could change. Regardless, the end amount of ether retrieved per locked BBK token should remain the same. It is mostly just a matter of presentation

### Interfaces
The following interfaces are used:
1. `IAccessToken`
    * used in order to call `distribute()` and `burn()` functions previously described.
1. `IRegistry`
    * used in order to dynamically access `AccessToken` and `ExchangeRates`
1. `IExchangeRates`
    * used in order to get ACT:WEI rate

## Whitelist
`Whitelist` is very similar to `ContractRegistry`; it is a very simple contract with a single mapping and ownership. `Ownable` from OpenZeppelin is used for ownership.

The single public mapping named `whitelisted` maps `address`es to `bool`s. The mapping can only be updated by `owner`. KYC information for `PoaToken` buyers is kept off-chain, complying with GDPR requirements. Off-chain information is verified along with an address. Once this KYC process has passed, the related `address` is set in the Whitelist mapping.

Where required, other contracts will check if an address is whitelisted on this contract.

## ExchangeRates
`ExchangeRates` is used as a central loction to retrieve off-chain fiat:eth prices and put them on chain. Calls can be made recursively for an indefinite period of time. This means that this contract can self-update at a given interval. It can also handle any number of fiat currencies. 

Given the above information, this contract allows for any number of contracts to use any number of fiat prices around the globe on-chain.

Prices are currently retrieved from [cryptocompare](https://www.cryptocompare.com/), but this can be easily changed through changing the settings of the given currency.

`ExchangeRates` and `ExchangeRateProvider` could be considered a binary system of contracts. Neither do much without the other and their main goal is the same: on-chain exchange rates.

They are seperate in order to better test them. Oraclize has some testing tooling... but the node requirements are <= node v6. With this in mind it was though to be a better idea to create a stub for testing which can be used in place of `ExchangeRatesProvider` while keeping `ExchangeRates` the same.

`ExchangeRates` job is to hold the settings data for each currency as well as the actual rates.

All rates are given in cent amounts. 
*ex: 1ETH = 50000 USD cents NOT 500USD*

### Settings
Oraclize provides different options for making calls. Most of them changeable for each currency in order to provide maximum flexibility, preventing the need to constantly redeploy. Each currency (`queryType`) has the following settings:
1. `queryString`
    * api endpoint to get data from
    * ex: `"json(https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=EUR).EUR"`
1. `callInterval`
    * amount of time in seconds to wait before making recursive call to fetch rate again
    * for one time only query: use 0
    * anything over 0 will run the query again every x seconds
1. `callbackGasLimit`
    * how much gas to provide Oraclize
    * typically is around 100k gas as of this writing

### Other Storage Explained
1. `ratesActive`
    * every callback with data checks for this
    * if false: stop recursive calls
    * if true: continue as normal with recursive calls
    * used in order to stop querying all rates
    * only changeable by `owner`
1. `rates`
    * `mapping` that maps ` bytes32 keccak256(string)` to a `uint256` rate in cents
    * ex: `keccak256("EUR") => 50000`
    * is set to `private` in order to force users to use getter functions which will fail when 0
    * 0 is safe because failed queries will also return 0
    * only changeable by `ExchangeRateProvider`
        * with the exception of ACT entry (`onlyOwner`)
1. `querytypes`
    * mapping which maps pending `queryId`s from Oraclize to currency strings.
    * used in order to set rate in `rates` when query completes
    * only changeable by `ExchangeRateProvider`
1. `currencySettings`
    * holds settings mentioned in above section for a given currency.
    * checked every time query completes, allowing for:
        * changing query strings to new source without redeploying
        * changing query intervals allowing for fine tuning.
        * change callbackGasLimit, in case original is too high or low
    * only changeable by `owner`

### Events
Events allow for a cheap way to record historical changes in events and other important things such as `Settings` changes.

####RateUpdatedEvent
This is emitted when a rate has been returned from a query and set in the `rates` mapping. `currency` and `rate` are the parameters.

####QueryNoMinBalanceEvent
Emitted when there is no minimum balance needed for query. Remedy this by sending ether to the `ExchangeRatesProvider` contract. No parameters are given.

####QuerySentEvent
Emitted upon query execution. Does not mean query was successful. Includes `currency` parameter.

####SettingsUpdatedEvent
Emitted every time settings have been changed for any currency. Includes `currency` parameter.

### `setActRate`
This is a special currency setter function. It is callable by `owner` unlike any of the other rates which are only retreivable through Oraclize. 

This works in this way because ACT is an internal mechanism in the Brickblock ecosystem.

### Setters
There are setters for setting all of a given currency's `Settings` at once, setting one `Settings` at a time, toggling `ratesActive`, and one for globally setting the callback gas price. These all should be pretty self explanatory.

### Getters
There are getters for a given currency's `Settings` as well as two different getters for getting rates.

`getRate()` allows for getting a `rate` by a string. This will hash the string and retrieve rate by this `bytes32` hash.

`getRate32()` gets a rate by directly using the hash. This makes for some required assembly functions in other contracts easier.

Both of these getters will `revert()` if the `rate` is 0.

## ExchangeRateProvider
Where `ExchangeRates` job is to hold the rates and the `Settings`, `ExchangeRateProvider` is meant to be exactly that, a provider. It inherits from the [OraclizeAPI](https://github.com/oraclize/ethereum-api/blob/aeea37a5232c981884e6f4c5be55d58a252a01f6/oraclizeAPI_0.5.sol) contract and makes use of the Oraclize API. To be clear, this is the contract actually interacting with Oraclize and getting the off-chain data. It sets this data in `ExchangeRates` when it receives a successful callback. Queries are triggered by `ExchangeRates` and cannot be started any other way.

As mentioned earlier, `ExchangeRatesProvider` does not really store any data itself. It only makes the calls and gets the callback.

### `sendQuery()`
This function kicks of the query using the `Settings` from `ExchangeRates`. It is only callable by `ExchangeRates`. It will use the helper `private` function called `setQueryId` to set the `queryId` on the `ExchangeRates`. This is used as a safeguard to prevent multiple calls from executing. For more information on why this is needed please see the [Oraclize documentation](http://docs.oraclize.it/).

### `__callback()`
This function is pretty standard for most Oraclize related contracts. The difference here is that it is using `ExchangeRates` to store the data and check to see if it should call again recursively. If it is recursive, then it will call `sendQuery()` again with the newest `Settings` from `ExchangeRates`.

### `selfDestruct()`
This is for the inevitable day when an upgrade will be needed. This will destroy the contract and send the funds back to the designated address. It can only be called through `killProvider()` on `ExchangeRates` which is only callable by `owner`.

## OraclizeAPI
This is a contract from [Oraclize](https://github.com/oraclize/ethereum-api/blob/aeea37a5232c981884e6f4c5be55d58a252a01f6/oraclizeAPI_0.5.sol). To learn more about Oraclize check the [documentation](http://docs.oraclize.it/)

## CentralLogger
`CentralLogger` mirrors events from each `PoaToken` listed by `PoaManager` (more on that in `PoaManager` section). One additional event parameter named `tokenAddress` is added for each event in order to keep track of different token's events. Having a central contract to log an undefined number of `PoaToken`s makes for easier tracking of events. This will be linked up to email notifications using the KYC data previously mentioned.

In the contract, all events found on `PoaToken` are also implemented here (with the additional `TokenAddress` parameter previous mentioned). There corresponding functions for each event which are prefixed wiht `log`. These functions are called from `PoaToken`s every time an event would normally be emitted. 

There is a modifier for each `log` function which checks if the sender is a `PoaToken` listed on `PoaManager` (more on that in the next section). This restricts anything other than listed `PoaToken`s from causing these events to be emitted.

`CentralLogger` uses several interfaces:
* `IRegistry`
    * Used in order to talk to `ContractRegistry` to talk to `PoaManager`
* `IPoaManager`
    * Used in order to check if a `PoaToken` is listed
* `IPoaToken`
    * Used to retrieve `string ProofOfCustody` in order to avoid some messy assembly involving strings.

## PoaManager
`PoaManager` is a central contract which is meant to keep track of and manage `broker`s and `PoaToken`s. This is needed due to the fact that multiple `PoaToken`s will be deployed and need to be kept track of.

`PoaManager`'s job is to:
1. deploy new `PoaToken`s
1. remove `PoaToken`s
1. list `PoaToken`s
1. delist `PoaToken`s
1. add new `broker`s
1. remove `broker`s
1. list `broker`s
1. delist `broker`s
1. pause `PoaToken`s
1. unpause `PoaToken`s
1. terminate `PoaToken`s
1. setup `PoaToken` master contracts
1. upgrade deployed `PoaToken`s
1. display information on `broker`s & `PoaToken`s

### Important Note
In order to fully understand `PoaManager`s role a quick introduction to upgradeable contracts must be given. 

`PoaToken`s deployed from PoaManager are not actually `PoaToken`s: 

*"They look like a PoaToken and talk like a PoaToken, but they are not actually PoaTokens."*

We use the [delegate proxy factory pattern](https://blog.zeppelin.solutions/proxy-libraries-in-solidity-79fbe4b970fd). What this means is that we have a `Proxy` that is deployed everytime you would expect a normal `PoaToken` to be deployed. This `Proxy` talks to a single instance of `PoaToken` which has been deployed. It uses `delegatecall` in the fallback function to catch all functions that you would normally use with a `PoaToken`. Those functions are called on the deployed master and act on the storage of the `Proxy` NOT the single deployed master `PoaToken`. This leads to some interesting possibilities, such as upgradeable contracts. This helps to futureproof each deployed `Proxy` against future requirement changes, whether they be legal or company related. This will be explained more in the Proxy and PoaToken sections of this README.

From here on, this concept will be expressed as `PoaProxy`. Even though this actual contract is not found anywhere in the repository, it express this concept: a `Proxy` which is mirroring the functionality of a `PoaToken`. The master code which `PoaProxy`s use will be referred to as `PoaMaster`.

### Broker Functions
A `broker` is a person with an address who has passed requirements to be able to list new properties on the Brickblock platform. Once when this screening process has passed, the `broker` is added through `addBroker()`. The broker starts off as `active` and is able to add `PoaProxy`s through `addToken()`.

A `broker can be removed or delisted by the `owner`. Information a `broker`'s status can also be retrieved.

### Token Functions
A new `PoaProxy` can be deployed through `addToken()` by a `broker` as long as they are `active`. A token requires the following parameters:
```
// ER20 name
string _name,
// ERC20 symbol
string _symbol,
// fiat symbol used in ExchangeRates to get rates
string _fiatCurrency,
// address of the custodian... more on this in PoaTokenSection
address _custodian,
// ERC20 totalSupply
uint256 _totalSupply,
// given as unix time (seconds since 01.01.1970)
uint256 _startTime,
// given as seconds offset from startTime
uint256 _fundingTimeout,
// given as seconds offset from fundingTimeout
uint256 _activationTimeout,
// given as fiat cents
uint256 _fundingGoalInCents
```

As long as these parameters pass validation, a new `PoaProxy` will be deployed and added to the `tokenAddressList` array.

There are similar functions to `broker` functions for modifying and viewing. These are only able to be run by the `owner` as well. To repeat, this functionality includes things such as: removing, listing, delisting, and viewing, a `PoaProxy`.

There are additional functions which are special for `PoaProxy`s.

#### Pause Token
`PoaProxy` is an ERC20 `PausableToken` from OpenZeppelin. The noteworthy thing here is that `PoaManager` is the `owner` for all `PoaProxy`s and `PoaToken`s.

#### Unpause Token
Same as above but for unpausing.

#### Terminate Token
This puts the `PoaProxy` into a special stage where the token is irreversibly paused buy payouts are still allowed. See the PoaToken section for more details.

#### Setup PoaToken
This is a special step that is needed in order to accomodate the delegate proxy factory pattern implemented for `PoaProxy` and `PoaMaster`. A constructor cannot be used to initialize storage. This needs to be run instead. Consider it as a delayed constructor function for now. We will go into more detail in the PoaToken and Proxy sections.

#### Upgrade Token
This is allows for upgrading an individual `PoaProxy` by pointing it to a different instance of `PoaMaster`.

## Proxy
This is the contract which produces the concept of `PoaProxy`, a `Proxy` contract using code via `delegatecall` on `PoaMaster`. This pattern is beyond the scope of this README, but here are some useful links to learn more:
1. [A great presentation on upgradeable contracts in general from **jackandtheblockstalk**](https://docs.google.com/presentation/d/1AlxKIAEfX5vKRkNQqUsZxtZh1ZQ9omNxvud073IDUNw/edit#slide=id.g32f581369c_0_198)
1. [A nice Example from ZeppelinOS](https://github.com/zeppelinos/zos-lib/blob/2cf0aad3e4fb4d97e694b74fa73e9de680214657/contracts/upgradeability/OwnedUpgradeabilityProxy.sol)

`Proxy` is a closer implementation to the ZeppelinOS version. It keep no sequential storage itself. This is done through using `bytes32` hashes as slots which will never collide with any master code it calls to unless intentionally done.

### Important Note
All functions and variables (technically constants are not stored in storage but in code) are prepended with `proxy`. As a general rule, when upgrading NEVER use/set/create any variable, storage, or function with this prefix. This will result in very unpredictable and dangerous behavior.

When upgrading it is also very important to note that you cannot change the order of ANY variables in the `PoaMaster` upgrade or you will have storage set in incorrect slots when making use of the upgraded `PoaProxy`. Chaos will ensue.

This can be very easily avoided by simply inheriting from the original `PoaMaster` and add/change the functionality on top of it. There is some really great [research on what can and cannot be upgraded](https://github.com/jackandtheblockstalk/upgradeable-proxy). As always extensive testing is your best should be done before any sort of upgrade is even considered.

### Proxy Storage
`Proxy` keeps, in non-sequential storage, a masterContract and a registry address. These are acessed through the getter functions `proxyMasterContract()` and `proxyRegistry()`

### Owner
There is no explicit `owner` but there is a single function, `proxyChangeMaster()` which requires that the caller is `PoaManager`. `PoaManager` can be considered the owner in this case.

### Upgrading
`proxyChangeMaster()` is the method used to upgrade a `PoaProxy`. This simply points the `Proxy` to a new `PoaMaster` which has already been deployed. New functionality and/or bugfixes would be in the new `PoaMaster`. Care must be taken to correctly preserve the storage from the previous version of `PoaMaster`. In order to upgrade, the new address must be a contract and the method must be called from `PoaManager`.

### Fallback Function
This is where the magic happens. This is where `delegatecall` is used to take code from `PoaMaster` and use it on the `Proxy`'s `storage`. This forms the concept of a `PoaProxy`. For more information on how this works, see the links previously listed above.

## PoaToken
This contract is what most of the ecosystem is built around. 

PoaToken represents an asset in the real world. The primary usage at the moment is real estate. A broker will go through a vetting process in order to participate in the ecosystem. Once when a broker has been listed on `PoaManager` they are able to deploy new `PoaProxy`s.

The contract is essentially a crowdsale for a given asset. Once when the funding goal has been reached and the contract has been activated, token balances are shown and can be traded at will. `PoaToken` is an ERC20 PausableToken. When active, payouts (ex. rent from the building) can be paid to the contract where token holders receive ether proportional to their token holdings.

### Important Note
A lot of assembly is used in this contract due to gas limitations. The contract implements a lot of functionality. It is still well below the maximum gas limit of mainnet, but `ganache-cli` has a bug at the time of writing where gas limits cannot be set above around 6.5e6 gas. It seemed at the time to be a better idea to ensure that testing could run smoothly by keeping this contract under that limit.

With that in mind, Interfaces needed to be removed, making necessary the use of assembly level calls in order to get return values where needed. Hopefully this can be resolved in the near future and a more clear version can be used as an upgrade via the proxy delegate call pattern.

### Roles
There are 4 different roles in `PoaToken`.

#### Owner
The `owner` is always `PoaManager`. The `owner` role self-updates every time an `onlyOwner` or `eitherCustodianOrOwner` function is run. This is done through making a call to `ContractRegistry` every time one of the above modifiers are invoked.

The `owner` can:
1. pause/unpause `transfer`s and `transferFrom`s
1. `toggleWhitelistTransfers()`
    * This is off by default at the time of writing. Though legal requirements may force Brickblock to enforce whitelisting ther person a token holder is transferring to. This allows the `owner` to enable that, should the occaision arise.
1. `terminate()`
    * move the contract to `Terminated` stage in the case of "acts of god" (ex. building burns down) or for some other reason where the contract cannot continue
    * moves irreversibly to `paused` state
    * `payout()`s can still happen to wind down contract (ex. insurance money from burned down building paid to contract)

#### Custodian
The `custodian` is considered a special entity such as a bank which is a legal custodian of the asset represented by the smart contract. This entity is in charge of making `payouts()`s to the contract.

The Custodian can:
1. `changeCustodianAddress()`
    * should custodian entities need to be changed, this is the way to do it.
1. `terminate()`
    * same as owner (see above)
1. `activate()`
    * move the contract from `Pending` to `Active` (see Stages section for more details)
    * must provide an IPFS hash which is set in the contract as proof of custody
        * this proves that the custodian is indeed in posession the asset and acknowledges that everythinng is in order through running this method from the custodian entity's address
1. `payout()`
    * payout income from the asset to the contract in ether to be claimed by PoaToken holders
1. `updateProofOfCustody()`
    * for auditing purposes, upate essential information contained in IPFS hash.

#### Broker
The broker has no particular role in any of the functions. But once when an asset has been fully funded through the `PoaToken` contract the balance at the time of activation becomes claimable by the broker. It is assumed the `broker` already has the property to turn over and the funds in the contract at the time of activation is compensation for the building. The broker can `claim()` the same way any other token holder would `claim()`

#### Token Holders
Token holders are considered to be users who have sent ether to the contract during the `Funding` stage AFTER the contract has entered the `Active` stage. Alternatively a token holder may come into possession of tokens through a `transfer` or `transferFrom`.

token holders can:
1. `claim()`
    * claim holder's share of ether after a `payout()`
1. `reclaim()`
    * reclaim ether paid by holder during `Funding` stage when in `Failed` stage
        * technically not a token holder at this point... but would have been if in `Active` stage

### Deadlines
There are 3 time related storage variables in the contract, they are all unix timestamps:
1. `startTime`
    * timestamp for when the "crowdsale" should start.
    * once past `startTime` anyone can start the "crowdsale" by running `startSale()`
        * `startSale()` moves the contract from `PreFunding` stage to `FundingStage`
1. `fundingTimeout`
    * is an offset from `startTime`
    * deadline for when `fundingGoalInCents` must be met.
    * if not met, anyone can call `setFailed()`
        * `setFailed()` moves contract from `Funding` to `Failed`
1. `activationTimeout`
    * is an offset from `startTime + fundingTimeout`
    * deadline by which custodian must `activate()`
    * if not met, anyone can call `setFailed()`

### Stages
There are 5 possible stages for the contract each of them enabling or restricting certain functionality:
1. `PreFunding`
    * starting stage, nothing can happen until `startTime` has passed
1. `Funding`
    * window between `startTime` and `startTime + fundingTimeout`
    * `fundingGoalInCents` must be met or will result in moving to `Failed` stage
1. `Pending`
    * stage where `fundingGoalInCents` has been met
    * waiting on custodian to `activate()` during window between `startTime` and `startTime + fundingTimeout + activationTimeout`
    * must be activated during window or will go to `Failed` stage
1. `Failed`
    * stage where deadlines were not met
    * can be entered through `reclaim()` or `setFailed()`
    * users who paid in ether can reclaim ether at this stage
    * end of lifecycle
1. `Active`
    * `fundingGoalInCents` was met and was `activate()`ed in time
    * regular long term stage where payouts and transfers can happen
1. `Terminated` 
    * `transfer`s & `transferFrom`s paused
    * `payout()`s can continue in order to wind down contract
    * end of lifecycle

### Concepts
This contract makes use of `balanceOf()` as an algorithm and dividend payouts much like `AccessToken`.

#### `balanceOf()` Override & Additional ERC20 Overrides
It is almost never a great idea to run a huge for loop in solidity. But we need a way to distribute all of these access tokens to locked BBK holders. How is that done? Enter balanceOf as an algorithm.

The easiest way to understand this is through a more pure version of this concept. [NoobCoin](https://github.com/TovarishFin/NoobCoin) is a project which implements this and only this. It is a good starting point for understanding this concept.

Essentially what is happening here is that instead of just giving back a number, we are giving a starting balance plus received amounts minus sent amounts.

This contract calculates the starting balance of a user based on the original ether investment made. You can also see that it is returning 0 until we have entered or passed a specific stage (`Active`):

```
  // used for calculating starting balance once activated
  function startingBalance(address _address)
    private
    view
    returns (uint256)
  {
    return uint256(stage) > 3
      ? investmentAmountPerUserInWei[_address]
        .mul(totalSupply())
        .div(fundedAmountInWei)
      : 0;
  }
```

With this piece of code, users will have a correct balance in proportion to what they paid relating to the `fundingGoalInCents`, after the contract has entered the `Active` stage.

This is the same concept as NoobCoin except the startingBalance is not a static number, but instead yet another algorithm. You can see here that it is very much the same (from `PoaToken`):

```
  // ERC20 override uses NoobCoin pattern
  function balanceOf(address _address)
    public
    view
    returns (uint256)
  {
    return startingBalance(_address)
      .add(receivedBalances[_address])
      .sub(spentBalances[_address]);
  }
```

`transfer()` and `transferFrom()` both use overrides very similar to NoobCoin, where `receivedBalances` and `spentBalances` are updated and `balanceOf()` is used instead of `balances`.

#### Dividends
The method of calculating dividends is also very much like `AccessToken`. Please read the AccessToken section before continuing.

The only difference here is that instead of balances being taken care of during locking and unlocking BBK in `AccessToken`, the balance is instead taken care of when a `transfer` or `transferFrom` occurs.

This balannce is kept track of in `unclaimedPayoutTotals`.

#### Fiat Rates
Because the `Funding` stage of a contract can go on for up to a month or more... the funding goal of the contract needed to be denominated in fiat. Otherwise flucuating rates could make it impossible to buy the asset in real life. Fiat rates are gotten from the `ExchangeRates` contract.

## BrickblockAccount
This contract is Brickblock's sole method of using the company's share of BBK and interacting with the ecosystem as a user until November 30, 2020. 

### Pulling & Withdrawing BBK
As mentioned in the BrickblockToken section, company tokens are pulled into this `BrickblockToken` using `transferFrom` with the allowance that `BrickblockToken` makes for `BrickblockAccount`. This can be seen, as implemented in the contract itself, below:

```
  function pullFunds()
    external
    onlyOwner
    returns (bool)
  {
    IBrickblockToken bbk = IBrickblockToken(
      registry.getContractAddress("BrickblockToken")
    );
    uint256 _companyFunds = bbk.balanceOf(address(bbk));
    return bbk.transferFrom(address(bbk), this, _companyFunds);
  }
```

Once in `BrickblockAccount` there are only functions for using the tokens to interact with the ecosystem. But none to actually withdraw the tokens to a regular user account unntil November 30, 2020. This can be show below:

```
  function withdrawBbkFunds(
    address _address,
    uint256 _value
  )
    external
    onlyOwner
    returns (bool)
  {
    require(fundsReleaseBlock < block.number);
    IBrickblockToken bbk = IBrickblockToken(
      registry.getContractAddress("BrickblockToken")
    );
    return bbk.transfer(_address, _value);
  }
```

`fundsReleaseBlock` needs to be set in the constructor. This means that the contract will need to be up an verified before running `finalizeTokenSale()` on `BrickblockToken`.

### Ecosystem Interaction Functions
There are functions included in this contract to do what any other user would do (except transferring):
1. `lockBBK()`
    * lock given amount of BBK tokens into `AccessToken` to receive ACT
1. `unlockBBK()` 
    * unlock given amounnt of BBK tokens sending back to this contract
    * useful in case needing to adjust economics based on amount of tokens locked in (company tokens are a large portion)
1. `claimFee()`
    * claim ether in return for given amount of ACT rewarded from locked BBK
    * ether is sent to this contract
1. `withdrawEthFunds()`
    * withdraw given amount of ether and send to given address
1. `withdrawActFunds()`
    * transfer given amount of ACT tokens to given address

#### Payable Fallback Function
A payable fallback function is needed in order to have ether sent in return for ACT when using `claimFee()`.

## Built With
* [Truffle v4.1.8](https://github.com/trufflesuite/truffle/releases/tag/v4.1.8)
* [openzeppelin-solidity v1.9.0](https://github.com/OpenZeppelin/openzeppelin-solidity/releases)

## Authors
* **Cody Lamson** - [TovarishFin](https://github.com/TovarishFin)
* **Matt Stevens**  - [mattgstevens](https://github.com/mattgstevens)
* **Volkan Bilici**  - [vbilici](https://github.com/vbilici)
* **Adrian Kizlauskas**  - [dissaranged](https://github.com/dissaranged)
* **Marius Hanne** - [mhanne](https://github.com/mhanne)
