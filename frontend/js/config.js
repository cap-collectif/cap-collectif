// @flow
import EventEmitter from 'events';

export const Emitter = new EventEmitter();

export const getBaseUrl = () =>
  `${typeof window !== 'undefined' ? window.location.protocol : 'https:'}//${
    typeof window !== 'undefined' ? window.location.host : 'Unknown'
  }`;

const isDev = () =>
  getBaseUrl() === 'https://capco.dev' || getBaseUrl() === 'https://admin-next.capco.dev:3001';

// This may not be up to date in admin-next
export const baseUrl = getBaseUrl();

export const isSafari =
  typeof window !== 'undefined' &&
  window.navigator &&
  /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);

export const getBaseUrlWithAdminNextSupport = () => {
  if (isDev()) {
    return 'https://capco.dev';
  }
  return getBaseUrl();
};

export const getAdminNextUrl = () => {
  if (isDev()) {
    return 'https://admin-next.capco.dev:3001';
  }
  return `${getBaseUrl()}/admin-next`;
};

const isTest = () => getBaseUrl() === 'https://capco.test';

export const ALLOWED_IMAGE_MIMETYPES = [
  'image/png', // .png
  'image/svg+xml', // .svg
  'image/gif', // .gif
  'image/jpeg', // .jpeg .jpg
  'image/webp', // .webp
];

// This must be sync with API check in MediasController::ALLOWED_MIMETYPES
export const ALLOWED_MIMETYPES = [
  ...ALLOWED_IMAGE_MIMETYPES,
  'text/csv', // .csv
  'application/x-PhpStorm-csv-file', // .csv
  'text/anytext', // .csv
  'text/comma-separated-values', // .csv
  'application/pdf', // .pdf
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/vnd.oasis.opendocument.text', // .odt
  'application/vnd.oasis.opendocument.presentation', // .odp
  'application/vnd.oasis.opendocument.spreadsheet', // .ods
];

type MapTokens = {
  +[provider: string]: {
    +styleId: string,
    +styleOwner: string,
    +publicToken: string,
  },
};

const mapProviders: MapTokens = {
  MAPBOX: {
    publicToken:
      (typeof window !== 'undefined' && window.MAPBOX_PUBLIC_TOKEN) || 'INSERT_A_REAL_SECRET',
    styleOwner:
      (typeof window !== 'undefined' && window.MAPBOX_PUBLIC_STYLE_OWNER) || 'INSERT_A_REAL_SECRET',
    styleId:
      (typeof window !== 'undefined' && window.MAPBOX_PUBLIC_STYLE_ID) || 'INSERT_A_REAL_SECRET',
  },
};

export const getMapboxUrl = () => {
  const tokens = mapProviders.MAPBOX;
  return `https://api.mapbox.com/styles/v1/${tokens.styleOwner}/${tokens.styleId}/tiles/256/{z}/{x}/{y}?access_token=${tokens.publicToken}`;
};

export default {
  getGraphqlUrl: () => {
    const apiBaseUrl = getBaseUrlWithAdminNextSupport();
    const schema = isDev() ? 'dev' : 'internal';
    return `${apiBaseUrl}/graphql/${schema}`;
  },
  getApiUrl: () => {
    const apiBaseUrl = getBaseUrlWithAdminNextSupport();
    return `${apiBaseUrl}/api`;
  },
  mapProviders,
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
