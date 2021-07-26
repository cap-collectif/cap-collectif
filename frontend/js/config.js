// @flow
import EventEmitter from 'events';

export const Emitter = new EventEmitter();

export const getBaseUrl = () =>
  `${typeof window !== 'undefined' ? window.location.protocol : 'https:'}//${
    typeof window !== 'undefined' ? window.location.host : 'Unknown'
  }`;

const isDev = () =>
  getBaseUrl() === 'https://capco.dev' || getBaseUrl() === 'http://localhost:3000';

// This may not be up to date in admin-next
export const baseUrl = getBaseUrl();

const isTest = () => getBaseUrl() === 'https://capco.test';

export default {
  getGraphqlInternalUrl: () => {
    const apiBaseUrl = isDev() ? 'https://capco.dev' : getBaseUrl();
    return `${apiBaseUrl}/graphql/internal`;
  },
  getApiUrl: () => {
    const apiBaseUrl = isDev() ? 'https://capco.dev' : getBaseUrl();
    return `${apiBaseUrl}/api`;
  },
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
  isDev: isDev(),
  isTest: isTest(),
  isDevOrTest: isDev() || isTest(),
  isMobile: !!(
    typeof window !== 'undefined' &&
    window.navigator &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      window.navigator.userAgent,
    )
  ),
  isIframe: typeof window !== 'undefined' && window.self !== window.top,
};
