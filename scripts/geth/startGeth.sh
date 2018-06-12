#!/bin/bash
DIRECTORY=`dirname $0`
PATH='/privateChainData/geth'
FULL_PATH=$DIRECTORY$PATH

#if [ -d "$FULL_PATH" ]; then
    printf '%s\n' "Removing old chain data (../..$PATH)"
    /bin/rm -rf "./$PATH"
#fi

printf '%s\n' "init genesis block ($FULL_PATH)"
/usr/local/bin/geth --datadir "./privateChainData/" init "./scripts/geth/genesis.json"
printf '%s\n' "running geth..."
/usr/local/bin/geth --datadir "./privateChainData/" --rpc --rpcapi eth,net,web3,personal,miner,debug,txpool  --rpccorsdomain "*" --preload "scripts/geth/manageAccounts.js,scripts/geth/autoMine.js"  --nodiscover --networkid 4447 --targetgaslimit 94000000 --gasprice 0 --maxpeers 0 console
