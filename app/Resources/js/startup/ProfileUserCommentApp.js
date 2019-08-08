// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import type { Props } from '../components/Comment/Page/CommentPage';
import CommentPage from '../components/Comment/Page/CommentPage';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <CommentPage {...props} />
    </IntlProvider>
  </Provider>
);
