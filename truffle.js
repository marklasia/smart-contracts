module.exports = {
  networks: {
    dev: {
      host: 'localhost',
      port: 8545,
      network_id: 4447,
      gasPrice: 1e9
    },
    ropsten: {
      host: 'localhost',
      port: 8545,
      network_id: 3,
      gas: 4.6e6,
      gasPrice: 23e9
    },
    kovan: {
      host: 'localhost',
      port: 8545,
      network_id: 42,
      gas: 4.7e6,
      gasPrice: 20e9
    },
    rinkeby: {
      host: 'localhost',
      port: 8545,
      network_id: 4,
      gas: 7e6,
      gasPrice: 1e9
    },
    bbkFinalized: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 7e6,
      gasPrice: 1e9
    },
    bbkFinalizedWithPoa: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 7e6,
      gasPrice: 1e9
    }
  },
  mocha: {
    /*
     * Default
     * + Prints out test duration
     * + Faster
     * - Doesn't display gas costs
     */
    reporter: 'spec'

    /*
     * For local debugging
     * + Can analyze gas costs
     * - Slow
     * - Doesn't display test duration
     */
    // reporter: 'eth-gas-reporter'
  }
}
