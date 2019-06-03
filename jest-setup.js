// @flow
/* eslint-env jest */
import 'babel-polyfill';
import 'whatwg-fetch';

import $ from 'jquery';
// $FlowFixMe
import moment from 'moment-timezone';
// $FlowFixMe
import 'moment/locale/fr';
// $FlowFixMe
import { configure } from 'enzyme';
// $FlowFixMe
import Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
// $FlowFixMe
import ReactTestRenderer from 'react-test-renderer';
import { type GraphQLTaggedNode, type Environment, QueryRenderer } from 'react-relay';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl-redux';
// $FlowFixMe
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { createStore } from 'redux';

configure({ adapter: new Adapter() });

moment.locale('fr');
moment.tz.setDefault('Europe/Paris');

// $FlowFixMe
global.$ = require('jquery')(window);
// $FlowFixMe
global.$ = $;
// $FlowFixMe
global.jQuery = $;

global.Cookies = {
  getJSON: () => '',
  set: () => '',
};

global.Modernizr = {
  intl: true,
};

global.window.__SERVER__ = false;

const throwError = warning => {
  throw new Error(warning);
};

// $FlowFixMe
console.warn = throwError; // eslint-disable-line no-console

// Disable missing translation message as translations will be added later.
// We can add a toggle for this later when we have most translations.
// $FlowFixMe
console.error = message => {
  if (typeof message === 'string' && message.startsWith('[React Intl]')) {
    return;
  }
  throwError(message);
};

/**
 * This is a global function to test Relay components.
 * You can provide the GraphQL query with a great mock API.
 * It supports passing a redux state.
 *
 * It's highly opinionated because it does a full render and not shallow-rendering.
 *
 * See: https://facebook.github.io/relay/docs/en/testing-relay-components.html#fragment-container-tests
 */
function renderWithRelay<Props>(
  ui: React.ComponentType<Props>,
  {
    initialState = {
      default: { features: {} },
      user: { user: null },
      intl: { locale: 'fr-FR', messages: {} },
    },
    store = createStore(() => initialState, initialState),
    query,
    props = {},
    spec,
    environment = createMockEnvironment(),
  }: {
    store: Object,
    query: GraphQLTaggedNode,
    environment: Environment,
    spec: Object,
    props: Props,
    initialState: Object,
  } = {},
) {
  const TestRenderer = () => (
    <Provider store={store}>
      <IntlProvider>
        <QueryRenderer
          environment={environment}
          query={query}
          variables={{}}
          render={({ error, props: relayProps }) => {
            if (relayProps) {
              return React.createElement(ui, { ...props, ...relayProps }, null);
            }
            if (error) {
              return <div>{error.message}</div>;
            }
            return <div>'Loading...'</div>;
          }}
        />
      </IntlProvider>
    </Provider>
  );

  const renderer = ReactTestRenderer.create(<TestRenderer />);

  // $FlowFixMe we need an MockEnvironnment type
  environment.mock.resolveMostRecentOperation(operation =>
    MockPayloadGenerator.generate(operation, spec),
  );
  return renderer;
}

global.renderWithRelay = renderWithRelay;
