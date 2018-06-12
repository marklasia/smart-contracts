#Test envoironment for geth

###Requirements
geth 1.8.10
yarn ^1.6

###Steps for running tests on Geth private blockchain
1. Open 2 terminal windows and go to the project folder on both
1. run `yarn`
1. run `yarn start:geth`
1. On the other terminal window run the command `yarn truffle test test/main-tests/AccessToken.js --network devGeth`

###Notes:    
- you can change `AccesToken` to any file name under `main-tests` folder to test other contracts
- if you don't use mac osx you might need to change the geth bin path `/usr/local/bin/geth` inside `scripts/geth/startGeth.sh` file
- `scripts/geth/genesis.json` is the initial config for geth
- you can see the arguments used for running geth, inside `startGeth.sh` file.
- Everytime you run `yarn start:geth` it deletes the old blockchain data and creates a new one

###Auto Mining
`scripts/geth/autoMine.js` is for auto mining on geth. If you want to remove the automining future, just remove the file path in `startGeth.sh` -> `--preload` section. This file only supports ES5.

###Account Management
`scripts/geth/manageAccounts.js` file is used for account management. Currently it only unblocks 10 pre-made accounts for 60 minutes
. This file only supports ES5.

###Genesis Block
`scripts/geth/genesis.json` file is used for configuring and defining genesis block for geth. 10 pre-made accounts are filled with ether in the `alloc` section.