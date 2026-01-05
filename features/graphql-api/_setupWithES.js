/* eslint-env jest */
// Full setup: DB + ES restore
// Use this for tests that query ES-backed fields (proposals, contributions, contributors, votes, arguments)
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const env = process.env.CI ? 'ci' : 'local'

beforeEach(async () => {
  console.log('Restoring database…')
  console.time('restore_db')
  const { stderrDb } = await exec('fab ' + env + '.qa.restore-db')

  if (stderrDb) {
    console.error(`error: ${stderrDb}`)
  }
  console.log('Successfully restored database !')
  console.timeEnd('restore_db')

  console.log('Restoring ElasticSearch snapshot…')
  console.time('restore_es')
  const { stderrEs } = await exec('fab ' + env + '.qa.restore-es-snapshot')
  if (stderrEs) {
    console.error(`error: ${stderrEs}`)
  }
  console.log('Successfully restored ES !')
  console.timeEnd('restore_es')
})
