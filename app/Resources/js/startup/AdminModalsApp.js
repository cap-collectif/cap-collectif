// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import AdminModals from '../components/Admin/AdminModals';

export default (props: Object) =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <AdminModals {...props} />
 </Provider>
;
