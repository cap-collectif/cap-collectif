import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import NewOpinionButton from '../components/Opinion/NewOpinionButton';

export default props =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <NewOpinionButton {...props} />
 </Provider>
;
