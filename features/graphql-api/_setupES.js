/* eslint-env jest */
// ElasticSearch reset - use this for tests that query ES-backed fields
// (proposals, contributions, contributors, votes, arguments)
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const env = process.env.CI ? 'ci' : 'local'

beforeEach(async () => {
  console.log('Restoring ElasticSearch snapshot…')
  console.time('restore_es')
  const { stderrEs } = await exec('fab ' + env + '.qa.restore-es-snapshot')

  if (stderrEs) {
    console.error(`error: ${stderrEs}`)
  }
  console.log('Successfully restored ES !')
  console.timeEnd('restore_es')
})
