// @flow
import * as React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import EvaluationsIndexPage from '../components/Evaluation/EvaluationsIndexPage';

export default (props: Object) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <EvaluationsIndexPage {...props} />
    </IntlProvider>
  </Provider>
);
