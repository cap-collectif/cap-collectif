import React from 'react';
import { Provider } from 'react-redux';
import Navbar from '../components/Navbar/Navbar';
import ReactOnRails from 'react-on-rails';

export default (props) =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <Navbar {...props} />
 </Provider>
;
