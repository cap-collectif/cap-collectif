import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import OpinionPage from '../components/Opinion/OpinionPage';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <OpinionPage {...props} />
    </IntlProvider>
  </Provider>
);
