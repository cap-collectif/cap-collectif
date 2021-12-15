// @flow
/* eslint-env jest */
import { type IntlShape, type MessageDescriptor } from 'react-intl';
import type { RelayPaginationProp, RelayRefetchProp } from 'react-relay';

export const $refType: any = null;
export const $fragmentRefs: any = null;

export const intlMock: IntlShape = {
  locale: 'fr-FR',
  formats: {},
  messages: {},
  now: () => 0,
  formatHTMLMessage: (message: MessageDescriptor) => String(message),
  formatPlural: (message: string) => String(message),
  formatNumber: (message: string) => String(message),
  formatRelative: (message: string) => String(message),
  formatTime: (message: string) => String(message),
  formatDate: (message: string) => String(message),
  formatMessage: (message: MessageDescriptor) => String(message.id),
};

export const formMock: ReduxFormFormProps = {
  anyTouched: false,
  array: {
    insert: jest.fn(),
    move: jest.fn(),
    pop: jest.fn(),
    push: jest.fn(),
    remove: jest.fn(),
    removeAll: jest.fn(),
    shift: jest.fn(),
    splice: jest.fn(),
    swap: jest.fn(),
    unshift: jest.fn(),
  },
  asyncValidate: jest.fn(),
  asyncValidating: false,
  autofill: jest.fn(),
  blur: jest.fn(),
  change: jest.fn(),
  clearAsyncError: jest.fn(),
  clearSubmit: jest.fn(),
  destroy: jest.fn(),
  dirty: false,
  dispatch: jest.fn(),
  error: null,
  form: 'formName',
  handleSubmit: jest.fn(),
  initialize: jest.fn(),
  initialized: true,
  // initialValues: {},
  invalid: false,
  pristine: true,
  reset: jest.fn(),
  submitting: false,
  submitFailed: false,
  submitSucceeded: false,
  touch: jest.fn(),
  untouch: jest.fn(),
  updateSyncErrors: jest.fn(),
  valid: true,
  warning: null,
};

const environment = {
  UNSTABLE_getDefaultRenderPolicy: jest.fn(),
  __log: jest.fn(),
  getOperationTracker: jest.fn(),
  isRequestActive: jest.fn(),
  isServer: jest.fn(),
  options: jest.fn(),
  applyMutation: jest.fn(),
  sendMutation: jest.fn(),
  lookup: jest.fn(),
  sendQuery: jest.fn(),
  subscribe: jest.fn(),
  streamQuery: jest.fn(),
  retain: jest.fn(),
  unstable_internal: {
    areEqualSelectors: jest.fn(),
    createFragmentSpecResolver: jest.fn(),
    createOperationDescriptor: jest.fn(),
    getDataIDsFromFragment: jest.fn(),
    getDataIDsFromObject: jest.fn(),
    getFragment: jest.fn(),
    getPluralSelector: jest.fn(),
    getRequest: jest.fn(),
    getSelector: jest.fn(),
    getSelectorsFromObject: jest.fn(),
    getSingularSelector: jest.fn(),
    getVariablesFromFragment: jest.fn(),
    getVariablesFromObject: jest.fn(),
    getVariablesFromPluralFragment: jest.fn(),
    getVariablesFromSingularFragment: jest.fn(),
    isFragment: jest.fn(),
    isRequest: jest.fn(),
  },
  applyUpdate: jest.fn(),
  check: jest.fn(),
  commitPayload: jest.fn(),
  commitUpdate: jest.fn(),
  execute: jest.fn(),
  executeMutation: jest.fn(),
  executeWithSource: jest.fn(),
  getNetwork: jest.fn(),
  getStore: jest.fn(),
  areEqualSelectors: jest.fn(),
  createFragmentSpecResolver: jest.fn(),
  createOperationDescriptor: jest.fn(),
  getDataIDsFromFragment: jest.fn(),
  getDataIDsFromObject: jest.fn(),
  getFragment: jest.fn(),
  getPluralSelector: jest.fn(),
  getRequest: jest.fn(),
  getSelector: jest.fn(),
  getSelectorsFromObject: jest.fn(),
  getSingularSelector: jest.fn(),
  getVariablesFromFragment: jest.fn(),
  getVariablesFromObject: jest.fn(),
  getVariablesFromPluralFragment: jest.fn(),
  requiredFieldLogger: jest.fn(),
};

export const relayPaginationMock: RelayPaginationProp = {
  environment,
  hasMore: () => false,
  isLoading: () => false,
  loadMore: jest.fn(),
  refetchConnection: jest.fn(),
};

export const relayRefetchMock: RelayRefetchProp = {
  environment,
  refetch: jest.fn(),
};

export const googleAddressMock = {
  lat: 43.6424564,
  lng: -79.3755156,
  json:
    '[{"formatted_address":"10 Yonge St, Toronto, ON M5E 1R4, Canada","geometry":{"location":{"lat":43.6424564,"lng":-79.3755156},"location_type":"ROOFTOP","viewport":{"south":43.6411074197085,"west":-79.37686458029151,"north":43.6438053802915,"east":-79.37416661970849}},"types":["street_address"],"address_components":[{"long_name":"10","short_name":"10","types":["street_number"]},{"long_name":"Yonge Street","short_name":"Yonge St","types":["route"]},{"long_name":"Old Toronto","short_name":"Old Toronto","types":["political","sublocality","sublocality_level_1"]},{"long_name":"Toronto","short_name":"Toronto","types":["locality","political"]},{"long_name":"Toronto Division","short_name":"Toronto Division","types":["administrative_area_level_2","political"]},{"long_name":"Ontario","short_name":"ON","types":["administrative_area_level_1","political"]},{"long_name":"Canada","short_name":"CA","types":["country","political"]},{"long_name":"M5E 1R4","short_name":"M5E 1R4","types":["postal_code"]}],"place_id":"ChIJrbgtxSvL1IkR2xGe7JZyuw0","plus_code":{"compound_code":"JJRF+XQ Toronto, ON, Canada","global_code":"87M2JJRF+XQ"}}]',
};
