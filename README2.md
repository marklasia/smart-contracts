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
1. ContractRegistry
1. BrickblockToken
1. AccessToken
1. FeeManager
1. Whitelist
1. ExchangeRates
1. ExchangeRateProvider
1. OraclizeAPI
1. CentralLogger
1. PoaManager
1. Proxy
1. PoaToken
1. BrickblockAccount

Standalone Contract:
1. CustomPoaToken

![Brickblock Ecosystem](https://www.draw.io/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=Untitled%20Diagram.xml#R7Vzfc5s4EP5r%2FJgMSObXo%2B02vZu7znnazrV9VLCMmWDkA5w4%2FetPAgmDJBpsA3Y7%2BCVmJYTQftpvtbvOBC62hw8J2m0%2BkhWOJsBYHSbw3QQAcwoN%2BodJXguJA6eFIEjCFe90FHwOf2Au5PcF%2B3CF01rHjJAoC3d1oU%2FiGPtZTYaShLzUu61JVH%2FqDgVYEXz2UaRKv4arbMOlpmEcG%2F7AYbDhj3Yt3vCI%2FKcgIfuYP28C4Dr%2FFM1bJMbi%2FdMNWpGXigi%2Bn8BFQkhWfNseFjhiayuWrbjvoaG1nHeC46zVDRhB03E8YwV85Lnwjo%2FwjKI9X4uZ7%2BM0%2FUKecDwBdkSHnT8mbOrZK18u%2B789m%2B98TeLsLs2VOaMdTLCjgJgf2%2Bm3oPgLavcDOieqWXoxf9mEGf68Qz5reaHgorJNto3olUm%2F5iuL2dwNelUuHmvyyTb0eUOEHnE0L1WxIBFJaFNMYvaMNEvoywgh1ZCRf8oWoXE26jqMokrPh%2FzDX%2FUBbcOIAfxfnKxQjLiYo9kE%2FFr3IBSFQUxlPlUTTsolqepNKAInGT5URFyPHzDZ4ix5pV14KxQY5HvOcvn1yxHBHhdtKth1uAzxPROUIx9xQ79w6LSEka3ASGAn3aH4IvR8ZRCJwjQTI9LJFYOO6OoPXVPbqqHL9iwFXaV5rMLL7gNeTn%2FwWpLZCKwBgWXDt82WFli92C1XAdaSoI90lQL6vqP%2Be9C%2FByT9O869aloGIy5PAcADxiMAegSAZdyQ3yIOIH0wyzwJ%2FafHiPhP1KWm%2Bh0dmCFhZk5lmAGNnTGBzoWx%2BkCaetLqDGnvD%2F4GxQH%2BhDJ6ih5RNqA3A0pUlY6yxp8xrZ4cZR2oZD3HqxkLkbA3j1CaMoXRRUdJpoorWseHMPvGVEvfr7j6LlpiOstKE7v8zkHQUkWNK5%2BSfeKLoEzDKYBOPcBZQx%2BxInhVi%2FioCqyox9LYACFLcISy8LkeJ9KpjD9hSUJm6Et8NJGdGKJ4YX5XNXAjDeTY9YFsUzJSxaooA%2BUIKl%2B7HaiA6hOFiM1F2Bn6lZsaCWt012SS8cDUfqHHvAMDyI5NMJ%2ByNZ9Y73Tbku2%2B0EfRjDdsw9WK3d9kYY4xt0vw17T1y6Ajf4lJNXCnMwnGvWFMzZqy7kAnYLK0g4r7yXqd4ot1b%2FXtD%2BUOUS26OBLVAEQFoUxUDtQQFdARVRfukC5A2BFRlXRUI6OStr5VCE1QWK80Jc4UNZ6yboqW3DqZTI0zWcmUgjllTLoHVlJjgFvyzKhoQbbUfLDFm8%2F%2F%2Bp0oSeyZLijJ8WqKMi%2BDUbecowbhGEfQ2%2FZx8YW%2B789UPJDhKFo2JAl%2FUN2haAiXV2tLGnJ4N2pbXIk%2BzrUtU9ibxyvIqGpbirnMFl%2FawU13cqpip4o3czLkqcn75RAE5MymdyY9Aavuh1sW7A1CUIEQBUe4paI11pyU3gSR1jiZDaapf5%2BmBYi8mwLRnRT%2Fc8C5Po508Jbj0B1iaKpgaIdez0aQzgwdIzaqIdLTW6Prc%2FVQz4i3S%2FGmHvb9Dc4drhdRdEGP0127Wwr9yRDLyO4W8GWP%2BLoQX%2Bqh308wytihbZeQw%2BuSoAuYsY316hVErgoi2PacL7Rq3JuG4dY0Isj2Orhy4Zm48qSBbNDO2aLKzklOdOPHce2jOj13AjWiIJ87ezltDpw10blutxWNurM6giCUi9bkbEuHtk0tHOklnbtMyHO4YrUoY7D8lGC5JmimbJzmrK5RPzc6upyu5aoboosaFQH%2BPpD1T4L8iHabLf8cAXVFQHnGkIDqsUiggdROjkdITPQmy4FWUa2rsprlyBk399w0i1pl4vSXaJmq9mdXkBBbb8KUdSwDSIoyAJaQyKhtyRRg%2FVrpl9apljpA4c93v3Fv2LZT05%2Fwym4iAQOBonE6LtVxyNhmXdR%2B7JLQz1VNYt7SvwnR1yCd7DGfalwEA1eNS2FwrlZG5Eke8tmWRBrI6e%2F0D9WIeGd%2BzILBBEV%2FkyAYXeNBPRlXKmjTljv29fMNqAYslyyONP5O8YYR40gJ4SHr%2FaEa4tmnzG%2FJf%2FVFuZ05NR3zmCYs2ZyKuSxgeTKxWSqx6UPjVysekKv2p2dWDzhStaQtM2aHRKfWr3RHdPs0I9slQZ2ZuJErB7N8ENYx6BmD%2FgQFqiHKiATMbDxjEWG%2FvCTh54WWHaT2TjVybXJ9hW96w1kZ04Csjty2TcNxHdcz7Lo1A%2FDe8DzPNF3LNm1TyrS0TtnIRhK0K7G6WspmqoayFjzy8AkHYSp2SBXWRwtlvm3OLo0WtDcO5bYX5W22xi3SmobT%2FSJ6efwXI8WyH%2F%2BPC3z%2FPw%3D%3D)

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

### Important Note
In early development there was a contract called `BrickblockFountain`. The address value on the current `BrickblockToken` on mainnet is `fountainContractAddress`. This is actually the `BrickblockAccount` contract. Concepts and methods of handling company tokens have changed since deployment of the `BrickblockToken` contract. The end result is exactly the same as originally intended. Only the execution and variable names are different.

`BrickblockAccount` was essentially meant to be part of the functionality of `AccessToken`. It was later found to be a better idea to seperate these contracts for clarity and cleaner code.

There is also a `toggleDead` function which does not do anything other than set a cosmentic `bool` variable. It is only meant to be a flag to set should the worst happen...

## AccessToken


## FeeManager


## Whitelist


## ExchangeRates


## ExchangeRateProvider


## OraclizeAPI


## CentralLogger


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
