/* eslint-env jest */
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const env = process.env.CI ? 'ci' : 'local';

beforeAll(async () => {
  console.log('Writing ElasticSearch snapshot...');
  const { stderr } = await exec('pipenv run fab ' + env + '.qa.save_es_snapshot');

  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  console.log('Successfully saved ElasticSearch snapshot');
});

afterAll(async () => {
  console.log('Restoring database...');
  const { stderrDb } = await exec('pipenv run fab ' + env + '.qa.restore_db');

  if (stderrDb) {
    console.error(`error: ${stderrDb}`);
  }
  console.log('Successfully restored database');

  console.log('Restoring ElasticSearch snapshot.');
  const { stderrEs } = await exec('pipenv run fab ' + env + '.qa.restore_es_snapshot');

  if (stderrEs) {
    console.error(`error: ${stderrEs}`);
  }
});
