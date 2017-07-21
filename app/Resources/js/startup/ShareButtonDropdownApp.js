import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import ShareButtonDropdown from '../components/Utils/ShareButtonDropdown';

export default props =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <ShareButtonDropdown {...props} />
 </Provider>
;
