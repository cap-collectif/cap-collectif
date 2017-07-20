import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import IdeaPage from '../components/Idea/Page/IdeaPage';

export default props =>
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <IdeaPage {...props} />
    </IntlProvider>
  </Provider>;
