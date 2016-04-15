import React from 'react';
import { Provider } from 'react-redux';
import NavbarRight from '../components/Navbar/NavbarRight';
import ReactOnRails from 'react-on-rails';

export default (props) =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <NavbarRight {...props} />
 </Provider>
;
