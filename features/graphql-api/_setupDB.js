/* eslint-env jest */
// Database reset - use this for tests that mutate the database
const util = require('util')
const execFile = util.promisify(require('child_process').execFile)

beforeEach(async () => {
  console.log('Restoring database…')
  console.time('restore_db')
  const { stderr: stderrDb } = await execFile('docker', [
    'exec',
    '-u',
    'capco',
    '-w',
    '/var/www',
    'capco_application_1',
    'bash',
    '-lc',
    process.env.CI_SHARED_TEST_DATA === '1'
      ? 'bash .circleci/profile-mysql-restore.sh'
      : 'mysql -h database -u root symfony < var/db.backup',
  ])

  if (stderrDb) {
    console.error(`error: ${stderrDb}`)
  }
  console.log('Successfully restored database !')
  console.timeEnd('restore_db')
})
