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



## Whitelist
`Whitelist` is very similar to `ContractRegistry`; it is a very simple contract with a single mapping and ownership. `Ownable` from OpenZeppelin is used for ownership.

The single public mapping named `whitelisted` maps `address`es to `bool`s. The mapping can only be updated by `owner`. KYC information for `PoaToken` buyers is kept off-chain, complying with GDPR requirements. Off-chain information is verified along with an address. Once this KYC process has passed, the related `address` is set in the Whitelist mapping.

Where required, other contracts will check if an address is whitelisted on this contract.

## ExchangeRates


## ExchangeRateProvider


## OraclizeAPI


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


## Proxy


## PoaToken


## BrickblockAccount



## Built With
* [Truffle v4.1.8](https://github.com/trufflesuite/truffle/releases/tag/v4.1.8)
* [openzeppelin-solidity v1.9.0](https://github.com/OpenZeppelin/openzeppelin-solidity/releases)

## Authors
* **Cody Lamson** - [TovarishFin](https://github.com/TovarishFin)
* **Matt Stevens**  - [mattgstevens](https://github.com/mattgstevens)
* **Volkan Bilici**  - [vbilici](https://github.com/vbilici)
* **Adrian Kizlauskas**  - [dissaranged](https://github.com/dissaranged)
* **Marius Hanne** - [mhanne](https://github.com/mhanne)
