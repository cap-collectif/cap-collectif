// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import CommentSection from '../components/Comment/CommentSection';

type Props = { commentableId: string };

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <CommentSection commentableId={props.commentableId} />
    </IntlProvider>
  </Provider>
);
