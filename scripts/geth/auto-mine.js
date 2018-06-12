/* global eth,miner,txpool */
/* eslint no-var:0 */
/* eslint no-console:0 */

function automine(milliSeconds) {
  setInterval(function() {
    if (!eth.mining && (txpool.status.pending || txpool.status.queued)) {
      console.log('miner start')
      miner.start()
    } else if (eth.mining) {
      console.log('miner stop')
      miner.stop()
    }
  }, milliSeconds)
}

automine(500)
