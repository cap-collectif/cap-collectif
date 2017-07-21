import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import IdeaCreate from '../components/Idea/Create/IdeaCreate';

export default props =>
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <IdeaCreate {...props} />
    </IntlProvider>
  </Provider>;
