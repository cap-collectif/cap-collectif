// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import AuthenticationPage from '../components/Page/AuthenticationPage';

export default (props: Object) =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <AuthenticationPage {...props} />
 </Provider>
;
