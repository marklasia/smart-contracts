# Brickblock Smart Contracts

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

## Running the tests

### Unit Tests
```
yarn test
```

### Stress Tests
```
yarn test:stress-test
```

### Security Analysis

```sh
yarn test:mythril
```

## Running the linter

```
yarn lint
```

## Development with testrpc and MetaMask
If you would like to use MetaMask in your dev environment then

* Copy the HD wallet mnemonic that testrpc logs during its initialization when running `yarn start:dev`
* Open the MetaMask extension in your browser, use the "lock" action from top right menu and click "I forgot my password"
* Use the copied mnemonic as the wallet seed
* set metamask network to `localhost:8545`
* This should give you some ETH and several accounts to work with
* If MetaMask gets out of sync (which can happen as it caches some state about the network it is connected to) then connect to another network and then back to your local testrpc on `localhost:8545`

## Deployment

Deployment can be carried out through truffle in the `package.json` script:
```
yarn migrate:dev
```

However for production, all smart contracts and interactions involving an owner are done through our cold-store solution where all transactions are signed offline.

### Deploy to Ropsten Testnet
If you want to deploy the contracts to ropsten (or mainnet in theory, but wouldn't be advisable and requires reconfiguration of truffle.js) then
* start a local node using ropsten testnet: `parity --chain `
* make sure that you have some ropsten ether
* open a shell and migrate via `yarn migrate:ropsten`

## Smart Contracts

### Main Contracts

These are the smart contracts which will power the Ethereum side of our platform. The following are included:

1. BrickblockToken
1. CustomPOAToken
1. BrickblockUmbrella
1. BrickblockAccessToken2
1. BrickblockAccount
1. BrickblockContractRegistry
1. BrickblockFeeManager
1. BrickblockWhitelist
1. POAToken2

### Testing Tools
These contracts have been used as testing stubs. They do not have any use in the actual ecosystem:
1. BrickblockFountainStub
1. BrickblockFountainStub
1. BrickblockUmbrellaStub
1. WarpTool

### Legacy Contracts
There are a variety of contracts that have not been described. These are to be considered legacy contracts. This includes but is not limited to:

1. Brickblock
1. BrickblockAccessToken
1. BrickblockFountain
1. BrickblockFountainExample
1. BrickblockTokenUpgraded
1. BrokenGenericRemoteContract
1. BrokenGenericRemoteContractUser
1. POAToken

This SHOULD be all the needed contracts for the immediate future, though changes are always possible.

## BrickblockToken
BrickblockToken is an ERC20 Token with added features enabling the Brickblock contract to:

* send out tokens from the token sale
* finalise the token sale according to previously agreed up terms
* approve the fountain contract to transfer tokens
* change the stored address for the fountain contract
* be tradable amongst users
* be tradable on exchanges
* be upgradeable

Company tokens are locked in by assigning the value to the contract itself. The owner never starts with any token balance. This way there is no way to move the tokens without predetermined functions. The tokens are approved to be locked into the `BrickblockAccessToken` contract when `finalizeTokenSale` is called. Once when the tokens are locked into the `BrickblockAccessToken`, there will be no way to move them until November 30, 2020.

The `BrickblockAccessToken` contract will later be called to lock the company funds into the fountain. See below for more details.

## CustomPOAToken
This is our first, simplified, implementation of our POAToken. It is intended as a proof of concept which we can use on mainnet as a first deployment. It has the following features:

### Contract Stages
Different contract stages are available for different parts of the contract's lifecycle. The token is paused in all stages other than `Active.` The following stages are:

#### Funding
In this stage, the following is possible:
* `whitelist` address
* `blacklist` address
* `buy`
* `setFailed` (only if timed out)

Generally, the idea here is that buyers who have passed KYC (know your customer) requirements should be able to buy tokens within the given timeout period. If the timeout period has passed, the contract stage will move to `Failed`. If the `fundingGoal` has been met, the contract will move to `Pending`.

**IMPORTANT NOTE:** *A very small amount of ether may be lost due to integer division (max 50 wei)*

#### Pending
The contract should move into `Pending` if and only if the `fundingGoal` has been met. At this point the only thing to do is for the `custodian` to `activate` the contract. In order to `activate`, the `custodian` must pay the required fee.

Once when the fee has been paid, all ether funds (other than fee) become claimable by the `custodian` which enables the custodian to purchase the asset.

After the contract has been activated, the stages moves to `Active`. If the contract is not activated before the timeout, the contract will move to the `Failed` stage.

#### Failed
This stage is where the contract goes when the timeout has passed and either the `custodian` did not activate a fully funded contract, or the contract never got fully funded.

When in `Failed`, the only thing that can be done is `reclaim`. This allows buyers to `reclaim` the funds that they have sent to the contract. When funds are reclaimed, the purchased tokens are burnt.

**IMPORTANT NOTE:** *A very small amount of ether may be lost due to integer division (max 50 wei)*

#### Active
In `Active` regular payouts from the `custodian` happens. The following things can be done during this stage:
* `payout`
* `claim`
* `terminate`
* `pause`
* `unpause`

Generally, what happens in this stage is that payouts are made by the custodian. These payouts are claimable as a ratio of tokens owned. Each token owner needs to `claim` in order to receive the ether payout. If there are multiple pending payouts for a token holder, a single `claim` is used for all payouts.

If a problem occurs, the owner can temporarily `pause` the contract, halting trading. When the issue is resolved, the owner can then `unpause`.

The custodian can `terminate` the contract at this stage which will move the contract stage to `Terminated`. This pauses the contract and makes it so that it cannot be unpaused.

#### Terminated
In the `Terminated` stage, payouts and claims can still happen. However the trading is permanently paused. This stage is meant to be a way for the `custodian` to make some final payouts before the contract is finished.

An example usage of this would be along the lines of:
1. a building is tokenized
1. everything goes well and is fully funded
1. custodian activates
1. payouts go on for a few years
1. the building burns down
1. contract is terminated
1. custodian gets insurance money
1. custodian makes a final `payout` with the insurance money to token holders

### Integrated Whitelist
The owner can whitelist or blacklist potential buyers. This is done through `whitelist` and `blacklist` functions.

### Flexible Token Rate
The token price is based on the `fundingGoal` and `initialSupply` given. Methods for getting the token price can be seen here:
```
// util function to convert wei to tokens. can be used publicly to see
// what the balance would be for a given Ξ amount.
// will drop miniscule amounts of wei due to integer division
function weiToTokens(uint256 _weiAmount)
  public
  view
  returns (uint256)
{
  return _weiAmount
    .mul(1e18)
    .mul(initialSupply)
    .div(fundingGoal)
    .div(1e18);
}

// util function to convert tokens to wei. can be used publicly to see how
// much Ξ would be received for token reclaim amount
// will typically lose 1 wei unit of Ξ due to integer division
function tokensToWei(uint256 _tokenAmount)
  public
  view
  returns (uint256)
{
  return _tokenAmount
    .mul(1e18)
    .mul(fundingGoal)
    .div(initialSupply)
    .div(1e18);
}
```

## BrickblockUmbrella (Work in Progress)
The Brickblock contract will allow brokers to be added and removed. It is also responsible for deploying new POATokens on behalf of valid brokers. It will be able to:

1. add a broker
1. remove a broker
1. list brokers
1. create new tokens
1. pay fees to FeeManager

The current fee payment implementation is out of date and will be changed.

## BrickblockAccessToken2 (Mostly Finished)
`BrickblockAccessToken2` allows for `BrickblockToken` holders to lock in their BBK in order to receive ACT whenever a fee is paid on the Brickblock network. When a fee is paid, users who have locked in their BBK receive an ACT reward proportional to their locked tokens relative to the entire locked BBK balance of the contract.

From a user's perspective, these are the important functions:

### lockBBK
A users who hold BBK (`BrickblockToken`) can lock their BBK into this contract in order to receive ACT (AccessTokens) whenever a fee is paid in the Brickblock ecosystem. BBK must be locked before a fee is paid in order to receive ACT. ACT tokens can be used to redeem ether from the `FeeManager` contract.

When locked, `BrickblockAccessToken2` owns the locked BBK and cannot be transferred.

### unlockBBK
To return locked BBK to the users. They simply need to use `unlockBBK`. This transfers BBK back to the user. The ACT balance remains unchanged. Future fee payments will not result in more ACT being generated for users with unlockedBBK.

### ERC20 Functionality
`BrickblockAccessToken2` is an ERC20 compliant token contract.

## BrickblockAccount (Mostly Finished)
`BrickblockAccount` is the sole means of the company to interact with the company tokens before the token release date of November 30, 2020. The code preventing token withdrawal is here:

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
    BrickblockToken bbk = BrickblockToken(
      registry.getContractAddress("BrickblockToken")
    );
    return bbk.transfer(_address, _value);
  }
```

The rest of this functionality allows Brickblock to interact with the ecosystem as any other participant. This is needed because the BBK balance of the company is not held by any wallet address, it is locked away in the contracts without a method to move to a wallet or transfer them until November 30, 2020.

## BrickblockContractRegistry (Mostly Finished)
This contract allows for the communication between other smart contracts in our ecosystem. It is a place essentially just a mapping of bytes to addresses. Conversions are made so that contracts can be accessed and set by strings. There are two functions:

`updateContract` allows for the owner of the contract to update an address entry. The name string is converted to bytes type and is then used to set the address in the mapping.

`getContractAddress` allows for retrieval of a contract's address by a string. When string if given, it is converted to bytes to be found in the mapping.

With this mapping, we are able to reliably retrieve and interact with other contracts in the Brickblock ecosystem. As long as the new addresses of a contract are updated here, contracts should be able to talk to one another, even if they have been redeployed.

## BrickblockFeeManager (Mostly Finished)
`BrickblockFeeManager` allows for other smart contracts or accounts to pay a fee to the contract. When a fee is paid, ACT (BrickblockAccessTokens) are created and given proportionally to lockedBBK holders.

Owners of ACT can claim Ether by running `claimFee`. When claiming, ACT is burnt in return for Ether.

The contract allows for only two functions:

### payFee
This function can be called by anyone. The intended use case though, is for entities needing to pay a fee in the Brickblock ecosystem. The main current use case is for the POAToken2 contract:

A fee is paid when activating and making a payout. The fee is paid to this contract.

When payFee is called, ACT is created in a ratio (currently 1:1) to the ether value sent. This ACT is created on the `BrickblockAccessToken2` contract.

### claimFee
Anyone with an ACT balance on the `BrickblockAccessToken2` contract can claim ether by calling this function. The amount of ether claimed burns the user's ACT according to the ether/ACT ratio (currently 1:1)

## BrickblockWhitelist (Mostly Finished)
This contract stores whitelisted addresses. This will allow users to buy POA tokens after being whitelisted. This is a very simple `Ownable` contract which has two functions:

```
function addAddress(address _address)
  public
  onlyOwner
{
  require(whitelisted[_address] != true);
  whitelisted[_address] = true;
  Whitelisted(_address, true);
}

function removeAddress(address _address)
  public
  onlyOwner
{
  require(whitelisted[_address] != false);
  whitelisted[_address] = false;
  Whitelisted(_address, false);
}
```

Any other contract in the ecosystem can check to see if an address has been whitelisted by accessing the `whitelisted` mapping.

## POAToken2 (Proof of Asset Token) (Work in Progress)
`POAToken2` represents an asset in the real world. The primary example at the moment is real estate. A broker will go through a vetting process and provide legal proof that they hold the asset in question.

POAToken will look very similar to `CustomPOAToken`. The main differences are:
1. it will pay fees to `FeeManager`
1. it will use external whitelist (`BrickblockWhitelist`)
1. it will most likely use an oracle to get and use exchange rates in relation to fundingGoal
1. it will be deployed from `BrickblockUmbrella`

## Built With
* [Truffle v4.0.18](https://github.com/trufflesuite/truffle/releases/tag/v4.0.18)
* [zeppelin-solidity v1.5.0](https://github.com/OpenZeppelin/zeppelin-solidity/releases)

## Authors
* **Cody Lamson** - [TovarishFin](https://github.com/TovarishFin)
* **Matt Stevens** - [mattgstevens](https://github.com/mattgstevens)
* **Adrian Kizlauskas** - *initial work* - [dissaranged](https://github.com/dissaranged)
* **Marius Hanne** - *initial work* - [mhanne](https://github.com/mhanne)

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
