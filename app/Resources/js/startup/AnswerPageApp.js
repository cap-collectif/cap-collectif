// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import type { Props } from '../components/Answer/AnswerPage';
import AnswerPage from '../components/Answer/AnswerPage';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <AnswerPage {...props} />
    </IntlProvider>
  </Provider>
);
