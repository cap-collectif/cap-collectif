// @flow
/* eslint-env jest */
import { type FormProps } from 'redux-form';
import { type IntlShape } from 'react-intl';
import type { RelayPaginationProp, RelayRefetchProp } from 'react-relay';

export const $refType: any = null;
export const $fragmentRefs: any = null;

export const intlMock: IntlShape = {
  locale: 'fr-FR',
  formats: {},
  messages: {},
  now: () => 0,
  formatHTMLMessage: message => String(message),
  formatPlural: message => String(message),
  formatNumber: message => String(message),
  formatRelative: message => String(message),
  formatTime: message => String(message),
  formatDate: message => String(message),
  formatMessage: message => String(message.id),
};

export const formMock: FormProps = {
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
  initialValues: {},
  invalid: false,
  pristine: true,
  reset: jest.fn(),
  submitting: false,
  submitFailed: false,
  submitSucceeded: false,
  touch: jest.fn(),
  untouch: jest.fn(),
  valid: true,
  warning: null,
};

export const relayPaginationMock: RelayPaginationProp = {
  environment: {
    applyMutation: jest.fn(),
    sendMutation: jest.fn(),
    lookup: jest.fn(),
    sendQuery: jest.fn(),
    subscribe: jest.fn(),
    streamQuery: jest.fn(),
    retain: jest.fn(),
    unstable_internal: {},
  },
  hasMore: () => false,
  isLoading: () => false,
  loadMore: jest.fn(),
  refetchConnection: jest.fn(),
};

export const relayRefetchMock: RelayRefetchProp = {
  environment: {
    applyMutation: jest.fn(),
    sendMutation: jest.fn(),
    lookup: jest.fn(),
    sendQuery: jest.fn(),
    subscribe: jest.fn(),
    streamQuery: jest.fn(),
    retain: jest.fn(),
    unstable_internal: {},
  },
  refetch: jest.fn(),
};
