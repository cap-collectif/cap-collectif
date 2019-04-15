/* eslint-env jest */
import 'babel-polyfill';
import 'whatwg-fetch';

const GraphQLClient = require('graphql-request').GraphQLClient;

const endpoint = 'https://capco.test/graphql';
global.client = new GraphQLClient(endpoint, {
  headers: {
    authorization: 'Bearer iamthetokenofadmin',
    accept: 'application/vnd.cap-collectif.preview+json',
  },
});
