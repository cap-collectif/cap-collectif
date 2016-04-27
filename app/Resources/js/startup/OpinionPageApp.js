import React from 'react';
import { Provider } from 'react-redux';
import OpinionPage from '../components/Opinion/OpinionPage';
import ReactOnRails from 'react-on-rails';

export default (props) =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <OpinionPage {...props} />
 </Provider>
;
