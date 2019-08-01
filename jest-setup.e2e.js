/* eslint-env jest */
import 'babel-polyfill';
import 'whatwg-fetch';

const GraphQLClient = require('graphql-request').GraphQLClient;

const endpoint = 'https://capco.test/graphql';
const adminClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: 'Bearer iamthetokenofadmin',
    accept: 'application/vnd.cap-collectif.preview+json',
  },
});

const anonymousClient = new GraphQLClient(endpoint, {
  headers: {
    accept: 'application/vnd.cap-collectif.preview+json',
  },
});

const internalClient = new GraphQLClient('https://capco.test/graphql/internal', {
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

global.graphql = (query, variables, client = 'anonymous') => {
  switch (client) {
    case 'admin':
      return adminClient.request(query, variables);
    case 'internal':
      return internalClient.request(query, variables);
    case 'anonymous':
    default:
  }
  return anonymousClient.request(query, variables);
};
global.asyncForEach = asyncForEach;
