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
      bbr = BrickblockContractRegistry.new()
      grc = GenericRemoteContract.new()
      grcu = GenericRemoteContractUser.new()
    })

    it('should set an address', async () => {
      const preValue = await getContractAddress('testName')
      assert.equal(
        preValue,
        '0x' + '0'.repeat(40),
        'the uninitialized value should be address(0)'
      )
      await bbr.updateContract('testName', grc.address)
      const postValue = await getContractAddress('testName')
      assert.equal(
        postValue,
        grc.address,
        'the address should be set to the grc address'
      )
    })

    it('should NOT set an address when NOT owner', async () => {
      try {
        await bbr.updateContract('otherTestName', grc.address)
        assert(false, 'the contract should throw here')
      } catch (error) {
        console.log(error)
        assert(/invalid opcode/.test(error), 'the error should contain invalid opcode')
      }
    })
  })
})
