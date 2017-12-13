const BrickblockContractRegistry = artifacts.require('BrickblockContractRegistry')
const GenericRemoteContract = artifacts.require('GenericRemoteContract')
const GenericRemoteContractUser = artifacts.require('GenericRemoteContractUser')
const assert = require('assert')

describe('when setting addresses', () => {
  contract('BrickblockContractRegistry', accounts => {
    const owner = accounts[0]
    const notOwner = accounts[1]
    let bbr
    let grc
    let grcu

    before('setup bbr', async () => {
      bbr = await BrickblockContractRegistry.new()
      grc = await GenericRemoteContract.new()
      grcu = await GenericRemoteContractUser.new()
    })

    it('should set an address', async () => {
      const preValue = await bbr.getContractAddress('testName')
      assert.equal(
        preValue,
        '0x' + '0'.repeat(40),
        'the uninitialized value should be address(0)'
      )
      await bbr.updateContract('testName', grc.address)
      const postValue = await bbr.getContractAddress('testName')
      assert.equal(
        postValue,
        grc.address,
        'the address should be set to the grc address'
      )
    })

    it('should NOT set an address when NOT owner', async () => {
      try {
        await bbr.updateContract('otherTestName', grc.address, {
          from: notOwner
        })
        assert(false, 'the contract should throw here')
      } catch (error) {
        assert(/invalid opcode/.test(error), 'the error should contain invalid opcode')
      }
    })
  })
})
