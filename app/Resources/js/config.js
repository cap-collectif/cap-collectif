// @flow
const baseUrl = `${typeof window !== 'undefined'
  ? window.location.protocol
  : 'http'}//${typeof window !== 'undefined'
  ? window.location.host
  : 'capco.test/'}`;

export const graphQLUrl = `${baseUrl}/graphql/`;
export default {
  api: `${baseUrl}/api`,
  mapsAPIKey: '***REMOVED***',
  mapboxApiKey:
    '***REMOVED***',
};
