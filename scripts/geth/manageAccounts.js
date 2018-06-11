/* global personal,eth,miner,txpool */
/* eslint no-var:0 */
/* eslint no-console:0 */

for (var index = 0; index < personal.listAccounts.length; index++) {
  var acc = personal.listAccounts[index]
  console.log(acc)
  personal.unlockAccount(acc, 'bb', 60 * 60)
}

console.log('ready!')

function automine(seconds) {
  var n = seconds || 5
  setInterval(function() {
    if (!eth.mining && (txpool.status.pending || txpool.status.queued)) {
      console.log('miner start')
      miner.start()
    } else if (eth.mining) {
      console.log('miner stop')
      miner.stop()
    }
  }, n * 1000)
}

automine(1)
