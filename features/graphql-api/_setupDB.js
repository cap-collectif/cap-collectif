/* eslint-env jest */
// Database reset - use this for tests that mutate the database
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const env = process.env.CI ? 'ci' : 'local'

beforeEach(async () => {
  console.log('Restoring database…')
  console.time('restore_db')
  const { stderr } = await exec('fab ' + env + '.qa.restore-db')

  if (stderr) {
    console.error(`error: ${stderr}`)
  }
  console.log('Successfully restored database !')
  console.timeEnd('restore_db')
})
