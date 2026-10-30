/* eslint-env jest */
// Restore once per file only when every scenario leaves the ES fixture indices unchanged.
const execFile = require('util').promisify(require('child_process').execFile)

beforeAll(async () => {
  console.log('Restoring Elasticsearch snapshot once for this file…')
  console.time('restore_es')
  await execFile('docker', [
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
  console.log('Successfully restored ES !')
  console.timeEnd('restore_es')
})
