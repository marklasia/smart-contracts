const fs = require('fs')
const path = require('path')
const R = require('ramda')
const sha3 = require('ethereumjs-util').sha3

// all the deployed contracts that are singletons and need to be known by downstream consumers (like
// platform web client) are stored here
const deployedContractsByNetwork = require('../config/deployed-contracts.js')

// truffle compiles and then saves artifacts here
const contractBuildDirectory = path.resolve(__dirname, '../build/contracts')

// we group by contract name; seems more natural in the JSON file to organize by network
const deployedAddressesGroupedByContractName = R.toPairs(
  deployedContractsByNetwork
).reduce((acc, [networkId, contractsInNetwork]) => {
  R.toPairs(contractsInNetwork).forEach(([contractName, contractAddress]) => {
    // if accumulator does not have contract yet, set as empty hashmap
    if (acc[contractName] == null) acc[contractName] = {}

    // TODO: once CustomPOAToken is out, this can be removed
    if (contractName === 'CustomPOAToken') {
      const networkNames = {
        1: 'mainnet',
        4: 'rinkeby',
        42: 'kovan',
        4447: 'testnet'
      }
      // must be an array since CustomPOAToken is handle so "special" in platform
      acc[contractName][networkNames[networkId]] = [].concat(
        contractAddress.map(x => x.toLowerCase())
      )
      return
    }

    acc[contractName][networkId] = { address: contractAddress.toLowerCase() }
  })

  return acc
}, {})

// TODO:
// hopefully we never need to use CustomPOAToken and this can be removed soon
const customPoaAddressFilename = path.resolve(
  __dirname,
  '../build/CustomPOAToken-addresses.json'
)
const customPoaTokenAddresses =
  deployedAddressesGroupedByContractName.CustomPOAToken
delete deployedAddressesGroupedByContractName.CustomPOAToken
fs.writeFileSync(
  customPoaAddressFilename,
  JSON.stringify(customPoaTokenAddresses)
)
// end TODO: hope we remove real soon

// add the addresses into the build artifact
R.keys(deployedAddressesGroupedByContractName).forEach(contractName => {
  const contractArtifactFilename = path.join(
    contractBuildDirectory,
    `${contractName}.json`
  )
  const contractArtifact = JSON.parse(fs.readFileSync(contractArtifactFilename))

  // TODO:
  // we use `truffle-contract` in platform, and it must have all events in each network property...
  // ideally this would be read from the ABI but somehow this lib does its own weird thing
  const events = contractArtifact.abi
    .filter(item => item.type === 'event')
    .map(event => {
      const key =
        '0x' +
        sha3(
          `${event.name}(${event.inputs.map(input => input.type).join(',')})`
        ).hexSlice()
      return { [key]: event }
    })

  // keys existing in both objects, the values from second object is used
  contractArtifact.networks = R.merge(
    deployedAddressesGroupedByContractName[contractName],
    { events, updated_at: Date.now() }
  )

  fs.writeFileSync(contractArtifactFilename, JSON.stringify(contractArtifact))
})
