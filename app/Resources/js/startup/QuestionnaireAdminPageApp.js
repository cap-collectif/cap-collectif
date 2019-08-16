// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import QuestionnaireAdminPage from '../components/Questionnaire/QuestionnaireAdminPage';

export default props => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QuestionnaireAdminPage {...props} />
    </IntlProvider>
  </Provider>
);
