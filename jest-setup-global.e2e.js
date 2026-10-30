/* eslint-disable */
import 'babel-polyfill'
const util = require('util')
const execFile = util.promisify(require('child_process').execFile)

module.exports = async () => {
  if (process.env.CI_SHARED_TEST_DATA === '1') return

  console.log('Saving database…')
  console.time('save_db')
  const { stderr: stderrDb } = await execFile('docker', [
    'exec',
    '-u',
    'capco',
    '-w',
    '/var/www',
    'capco_application_1',
    'bash',
    '-lc',
    'mysqldump --opt -h database -u root symfony > var/db.backup',
  ])

  if (stderrDb) {
    console.error(`error: ${stderrDb}`)
  }
  console.log('Successfully saved database')
  console.timeEnd('save_db')

  console.log('Writing ElasticSearch snapshot…')
  console.time('save_es')
  const { stderr } = await execFile('docker', [
    'exec',
    '-u',
    'capco',
    '-w',
    '/var/www',
    'capco_application_1',
    'php',
    'scripts/qa/elasticsearch-snapshot.php',
    'save',
    '--confirm',
    ...(process.env.CI_SHARED_TEST_DATA === '1' ? ['--shared'] : []),
  ])

  if (stderr) {
    console.error(`error: ${stderr}`)
  }
  console.log('Successfully saved ElasticSearch snapshot')
  console.timeEnd('save_es')
}
