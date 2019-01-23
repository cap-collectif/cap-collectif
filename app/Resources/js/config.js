// @flow
export const baseUrl = `${typeof window !== 'undefined' ? window.location.protocol : 'https:'}//${
  typeof window !== 'undefined' ? window.location.host : 'capco.test'
}`;

export default {
  graphql: `${baseUrl}/graphql/internal`,
  api: `${baseUrl}/api`,
  mapsServerKey: '***REMOVED***',
  mapProviders: {
    MAPBOX: {
      apiKey:
        '***REMOVED***',
      styleOwner: 'capcollectif',
      styleId: '***REMOVED***',
    },
  },
  // https://github.com/elementalui/elemental/blob/master/src/constants.js
  canUseDOM: !!(typeof window !== 'undefined' && window.document && window.document.createElement),
  isMobile: !!(
    typeof window !== 'undefined' &&
    window.navigator &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      window.navigator.userAgent,
    )
  ),
};
