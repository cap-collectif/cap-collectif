/* eslint-disable */
import 'babel-polyfill';
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const env = process.env.CI ? 'ci' : 'local';

module.exports = async () => {
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
};
