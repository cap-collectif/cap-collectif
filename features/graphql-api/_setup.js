/* eslint-env jest */
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const env = process.env.CI ? 'ci' : 'local';

let isFirstRun = true;

beforeAll(async () => {
  if (isFirstRun) {
    console.log('Saving database…');
    console.time('save_db');
    const { stderrDb } = await exec('fab ' + env + '.qa.save_db');

    if (stderrDb) {
      console.error(`error: ${stderrDb}`);
    }
    console.log('Successfully saved database');
    console.timeEnd('save_db');

    console.log('Writing ElasticSearch snapshot…');
    console.time('save_es');
    const { stderr } = await exec('fab ' + env + '.qa.save_es_snapshot');

    if (stderr) {
      console.error(`error: ${stderr}`);
    }
    console.log('Successfully saved ElasticSearch snapshot');
    console.timeEnd('save_es');
  }
  isFirstRun = false;
});

afterEach(async () => {
  console.log('Purging RabbitMQ…');
  console.time('purge_mq');
  await exec('fab ' + env + '.qa.purge_rabbitmq');
  console.log('Successfully purged RabbitMQ !');
  console.timeEnd('purge_mq');
});

afterAll(async () => {
  console.log('Restoring database…');
  console.time('restore_db');
  const { stderrDb } = await exec('fab ' + env + '.qa.restore_db');

  if (stderrDb) {
    console.error(`error: ${stderrDb}`);
  }
  console.log('Successfully restored database !');
  console.timeEnd('restore_db');

  console.log('Restoring ElasticSearch snapshot…');
  console.time('restore_es');
  const { stderrEs } = await exec('fab ' + env + '.qa.restore_es_snapshot');
  if (stderrEs) {
    console.error(`error: ${stderrEs}`);
  }
  console.log('Successfully restored ES !');
  console.timeEnd('restore_es');
});
