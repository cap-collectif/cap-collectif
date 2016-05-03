import React from 'react';
import { Provider } from 'react-redux';
import ProfileBox from '../components/User/Phone/ProfileBox';
import ReactOnRails from 'react-on-rails';

export default (props) =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <ProfileBox {...props} />
 </Provider>
;
