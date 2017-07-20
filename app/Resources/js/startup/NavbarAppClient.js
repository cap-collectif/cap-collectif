import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import Navbar from '../components/Navbar/Navbar';

export default props =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <Navbar {...props} />
 </Provider>
;
