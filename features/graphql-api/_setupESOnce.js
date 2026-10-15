/* eslint-env jest */
// Restore once per file only when every scenario leaves the ES fixture indices unchanged.
const execFile = require('util').promisify(require('child_process').execFile)

const env = process.env.CI ? 'ci' : 'local'

beforeAll(async () => {
  console.log('Restoring Elasticsearch snapshot once for this file…')
  console.time('restore_es')
  await execFile('castor', [`${env}:qa:restore-es-snapshot`, '--confirm'])
  console.log('Successfully restored ES !')
  console.timeEnd('restore_es')
})
