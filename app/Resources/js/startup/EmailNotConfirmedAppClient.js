import React from 'react';
import { Provider } from 'react-redux';
import EmailNotConfirmedAlert from '../components/User/EmailNotConfirmedAlert';
import ReactOnRails from 'react-on-rails';

export default (props) =>
  <Provider store={ReactOnRails.getStore('appStore')}>
   <EmailNotConfirmedAlert {...props} />
  </Provider>
;
