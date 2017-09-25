import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import NewIdeaButton from '../components/Idea/NewIdeaButton';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <NewIdeaButton {...props} />
    </IntlProvider>
  </Provider>
);
