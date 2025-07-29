/* eslint-disable */
global['fetch'] = require('fetch-cookie/node-fetch')(require('node-fetch')); // Allow fetch to use cookies

// In development you can use, if you prefer:
// - https://capco.dev
// - https://127.0.0.1:8000
const HOSTNAME = 'https://capco.test';
const ENDPOINT = HOSTNAME + '/graphql';

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const env = process.env.CI ? 'ci' : 'local';

const GraphQLClient = require('graphql-request').GraphQLClient;

jest.setTimeout(50000);

jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2025-01-01T00:00:00Z').getTime());

const adminClient = new GraphQLClient(ENDPOINT, {
  headers: {
    authorization: 'Bearer iamthetokenofadmin',
    accept: 'application/vnd.cap-collectif.preview+json',
  },
});
const superAdminClient = new GraphQLClient(ENDPOINT, {
  headers: {
    authorization: 'Bearer iamthetokenofsuperadmin',
    accept: 'application/vnd.cap-collectif.preview+json',
  },
});

const anonymousClient = new GraphQLClient(ENDPOINT, {
  headers: {
    accept: 'application/vnd.cap-collectif.preview+json',
  },
});

const internalClient = new GraphQLClient(ENDPOINT + '/internal', {
  headers: {
    accept: 'application/json',
  },
  cookies: true,
});

global.toGlobalId = (type, id) => {
  return Buffer.from(type + ':' + id).toString('base64');
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const authenticatedInternalRequest = (username, password, query, variables) => {
  return fetch(HOSTNAME + '/login_check', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
    }),
  }).then(r => (r.ok ? internalClient.request(query, variables) : Promise.reject('Bad request')));
};

const unAuthenticatedInternalRequest = (query, variables) => {
  return fetch(HOSTNAME + '/logout', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  }).then(r => (r.ok ? internalClient.request(query, variables) : Promise.reject('Bad request')));
};

global.enableFeatureFlag = async name => {
  console.log(`Enabling feature flag "${name}"...`);
  await exec(`fab ${env}.app.toggle-enable --toggle=${name} --environment=test`);
  console.log(`Successfully enabled "${name}"`);
};

global.disableFeatureFlag = async name => {
  console.log(`Disabling feature flag "${name}"...`);
  await exec(`fab ${env}.app.toggle-disable --toggle=${name} --environment=test`);
  console.log(`Successfully disabled "${name}"`);
};

global.graphql = (query, variables, client = 'anonymous') => {
  if (typeof client === 'object') {
    return authenticatedInternalRequest(client.email, client.password, query, variables);
  }
  switch (client) {
    case 'admin':
      return adminClient.request(query, variables);
    case 'super_admin':
      return superAdminClient.request(query, variables);
    case 'internal_user':
      return authenticatedInternalRequest('user@test.com', 'user', query, variables);
    case 'internal_user_conseil_regional':
      return authenticatedInternalRequest(
        'conseilregional@test.com',
        'monsupermotdepassetropsafe',
        query,
        variables,
      );
    case 'internal_analyst':
      return authenticatedInternalRequest('analyst@cap-collectif.com', 'analyst', query, variables);
    case 'internal_analyst2':
      return authenticatedInternalRequest(
        'analyst2@cap-collectif.com',
        'analyst2',
        query,
        variables,
      );
    case 'internal_supervisor':
      return authenticatedInternalRequest(
        'supervisor@cap-collectif.com',
        'supervisor',
        query,
        variables,
      );
    case 'internal_supervisor2':
      return authenticatedInternalRequest(
        'supervisor2@cap-collectif.com',
        'supervisor2',
        query,
        variables,
      );
    case 'internal_spylou':
      return authenticatedInternalRequest('aurelien@cap-collectif.com', 'toto', query, variables);
    case 'internal_decision_maker':
      return authenticatedInternalRequest(
        'decisionmaker@cap-collectif.com',
        'decisionmaker',
        query,
        variables,
      );
    case 'internal_evaluer':
      return authenticatedInternalRequest('pierre@cap-collectif.com', 'toto', query, variables);
    case 'internal_admin':
      return authenticatedInternalRequest('admin@test.com', 'admin', query, variables);
    case 'internal_super_admin':
      return authenticatedInternalRequest('lbrunet@cap-collectif.com', 'toto', query, variables);
    case 'internal_saitama':
      return authenticatedInternalRequest('saitama@cap-collectif.com', 'mob?', query, variables);
    case 'internal_theo':
      return authenticatedInternalRequest('theo@cap-collectif.com', 'toto', query, variables);
    case 'internal_project_admin':
      return authenticatedInternalRequest('theo@cap-collectif.com', 'toto', query, variables);
    case 'internal_ian':
      return authenticatedInternalRequest('ian@cap-collectif.com', 'toto', query, variables);
    case 'internal_kiroule':
      return authenticatedInternalRequest('pierre@cap-collectif.com', 'toto', query, variables);
    case 'internal_mickael':
      return authenticatedInternalRequest('mickael@cap-collectif.com', 'toto', query, variables);
    case 'internal_maxidev':
      return authenticatedInternalRequest(
        'maxime.auriau@cap-collectif.com',
        'toto',
        query,
        variables,
      );
    case 'internal_not_confirmed':
      return authenticatedInternalRequest(
        'user_not_confirmed@test.com',
        'user_not_confirmed',
        query,
        variables,
      );
    case 'internal_welcomatic':
      return authenticatedInternalRequest(
        'msantostefano@cap-collectif.com',
        'capco',
        query,
        variables,
      );
    case 'internal_valerie':
      return authenticatedInternalRequest(
        'valerie.massondelmotte@cap-collectif.com',
        'toto',
        query,
        variables,
      );
    case 'internal_christophe':
      return authenticatedInternalRequest(
        'christophe.cassou@cap-collectif.com',
        'toto',
        query,
        variables,
      );
    case 'internal_omar':
      return authenticatedInternalRequest('omar@cap-collectif.com', 'toto', query, variables);
    case 'mediator':
      return authenticatedInternalRequest('mediator@cap-collectif.com', 'toto', query, variables);
    case 'internal':
      return unAuthenticatedInternalRequest(query, variables);
    case 'anonymous':
    default:
  }
  return anonymousClient.request(query, variables);
};
global.asyncForEach = asyncForEach;
