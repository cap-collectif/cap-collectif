// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import AccountBox from '../components/User/Profile/AccountBox';

export default (props: Object) =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <AccountBox {...props} />
 </Provider>
;
