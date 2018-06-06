#!/bin/bash
DIRECTORY=`dirname $0`
PATH='/privateChainData/geth'
FULL_PATH=$DIRECTORY$PATH

if [ -d "$FULL_PATH" ]; then
    printf '%s\n' "Removing old chain data ($FULL_PATH)"
    /bin/rm -rf "$FULL_PATH"
fi

printf '%s\n' "init genesis block ($FULL_PATH)"
/usr/local/bin/geth --datadir=./privateChainData/ init ./genesis.json
printf '%s\n' "running geth..."
/usr/local/bin/geth --datadir=./privateChainData/ --rpc --rpcapi eth,net,web3,personal,miner  --rpccorsdomain "*" --unlock "0,1,2,3,4,5,6,7,8,9" --password "password.txt" --nodiscover --networkid 4447 --mine
