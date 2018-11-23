import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import QuestionnaireStepPage from '../components/Page/QuestionnaireStepPage';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QuestionnaireStepPage {...props} />
    </IntlProvider>
  </Provider>
);
