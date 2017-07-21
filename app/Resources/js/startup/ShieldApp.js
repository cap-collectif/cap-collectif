// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import Shield from '../components/Page/ShieldPage';

export default (props: Object) =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <Shield {...props} />
 </Provider>
;
