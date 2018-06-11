/* global personal */
/* eslint no-var:0 */
/* eslint no-console:0 */

for (var index = 0; index < personal.listAccounts.length; index++) {
  var acc = personal.listAccounts[index]
  console.log(acc)
  personal.unlockAccount(acc, 'bb', 60 * 60)
}

console.log('Accounts unloocked ready!')
