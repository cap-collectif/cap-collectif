/* eslint-env jest */
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const env = process.env.CI ? 'ci' : 'local'

afterAll(async () => {
  console.log('Purging RabbitMQ…')
  console.time('purge_mq')
  await exec('fab ' + env + '.qa.purge-rabbitmq')
  console.log('Successfully purged RabbitMQ !')
  console.timeEnd('purge_mq')

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
