// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import CommentSection from '../components/Comment/CommentSection';

type Props = { commentableId: string };

export default ({ commentableId }: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <CommentSection commentableId={commentableId} />
    </IntlProvider>
  </Provider>
);
