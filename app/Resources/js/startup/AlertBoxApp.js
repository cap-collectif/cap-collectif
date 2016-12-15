import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import AlertBox from '../components/Alert/AlertBox';

export default props =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <AlertBox {...props} />
 </Provider>
;
