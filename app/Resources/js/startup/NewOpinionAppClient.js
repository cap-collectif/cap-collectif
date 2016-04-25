import React from 'react';
import { Provider } from 'react-redux';
import NewOpinionButton from '../components/Opinion/NewOpinionButton';
import ReactOnRails from 'react-on-rails';

export default (props) =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <NewOpinionButton {...props} />
 </Provider>
;
