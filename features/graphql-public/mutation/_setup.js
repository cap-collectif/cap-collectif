/* eslint-env jest */
const util = require('util');
const exec = util.promisify(require('child_process').exec);

afterAll(async () => {
  console.log('Restoring database...');
  const { stderr } = await exec('fab local.qa.restore_db');

  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  console.log('Successfully restored database');
});
