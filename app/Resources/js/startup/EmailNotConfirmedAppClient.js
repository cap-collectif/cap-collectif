// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import EmailNotConfirmedAlert from '../components/User/EmailNotConfirmedAlert';
import NewEmailNotConfirmedAlert from '../components/User/NewEmailNotConfirmedAlert';

export default (props: Object) =>
  <span>
    <Provider store={ReactOnRails.getStore('appStore')}>
      <EmailNotConfirmedAlert {...props} />
    </Provider>
    <Provider store={ReactOnRails.getStore('appStore')}>
      <NewEmailNotConfirmedAlert {...props} />
    </Provider>
  </span>
;
