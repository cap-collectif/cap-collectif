// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IntlProvider from './IntlProvider';
import GroupCreateButton, { type Props } from '../components/Group/GroupCreateButton';

export default (props: Props) => (
  <Provider store={ReactOnRails.getStore('appStore')}>
    <IntlProvider>
      <GroupCreateButton {...props} />
    </IntlProvider>
  </Provider>
);
