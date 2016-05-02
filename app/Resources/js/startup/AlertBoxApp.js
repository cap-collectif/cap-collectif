import React from 'react';
import { Provider } from 'react-redux';
import AlertBox from '../components/Alert/AlertBox';
import ReactOnRails from 'react-on-rails';

export default (props) =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <AlertBox {...props} />
 </Provider>
;
