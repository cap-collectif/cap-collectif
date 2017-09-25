import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import IdeasIndexPage from '../components/Idea/Page/IdeasIndexPage';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <IdeasIndexPage {...props} />
    </IntlProvider>
  </Provider>
);
