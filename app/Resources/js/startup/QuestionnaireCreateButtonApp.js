// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import QuestionnaireAdminCreateButton, {
  type Props,
} from '../components/Questionnaire/QuestionnaireAdminCreateButton';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <QuestionnaireAdminCreateButton {...props} />
    </IntlProvider>
  </Provider>
);
