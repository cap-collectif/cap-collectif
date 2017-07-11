import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import ProfileBox from '../components/User/Phone/ProfileBox';

export default props =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <ProfileBox {...props} />
 </Provider>
;
