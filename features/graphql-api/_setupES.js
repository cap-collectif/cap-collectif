/* eslint-env jest */
// ElasticSearch reset - use this for tests that query ES-backed fields
// (proposals, contributions, contributors, votes, arguments)
const util = require('util')
const execFile = util.promisify(require('child_process').execFile)

beforeEach(async () => {
  console.log('Restoring ElasticSearch snapshot…')
  console.time('restore_es')
  const { stderr: stderrEs } = await execFile('docker', [
    'exec',
    '-u',
    'capco',
    '-w',
    '/var/www',
    'capco_application_1',
    'php',
    'scripts/qa/elasticsearch-snapshot.php',
    'restore',
    '--confirm',
    ...(process.env.CI_SHARED_TEST_DATA === '1' ? ['--shared'] : []),
  ])

  if (stderrEs) {
    console.error(`error: ${stderrEs}`)
  }
  console.log('Successfully restored ES !')
  console.timeEnd('restore_es')
})
