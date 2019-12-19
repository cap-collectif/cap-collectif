/* eslint-env jest */
const util = require('util');
const exec = util.promisify(require('child_process').exec);

beforeAll(async () => {
  console.log('Writing ElasticSearch snapshot...');
  const { stderr } = await exec('fab local.qa.save_es_snapshot');

  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  console.log('Successfully saved ElasticSearch snapshot');
});

afterAll(async () => {
  console.log('Restoring database...');
  const { stderrDb } = await exec('fab local.qa.restore_db');

  if (stderrDb) {
    console.error(`error: ${stderrDb}`);
  }
  console.log('Successfully restored database');

  console.log('Restoring ElasticSearch snapshot.');
  const { stderrEs } = await exec('fab local.qa.restore_es_snapshot');

  if (stderrEs) {
    console.error(`error: ${stderrEs}`);
  }
});
