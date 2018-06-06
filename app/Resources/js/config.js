// @flow
export const baseUrl = `${typeof window !== 'undefined' ? window.location.protocol : 'https:'}//${
  typeof window !== 'undefined' ? window.location.host : 'capco.test'
}`;

export default {
  isTestEnvironment: baseUrl === 'https://capco.test',
  graphql: `${baseUrl}/graphql/`,
  api: `${baseUrl}/api`,
  mapsServerKey: '***REMOVED***',
  mapboxApiKey:
    '***REMOVED***',
  // https://github.com/elementalui/elemental/blob/master/src/constants.js
  canUseDOM: !!(typeof window !== 'undefined' && window.document && window.document.createElement),
};
