// @flow
import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import AddNewQuestionModal from '../components/Admin/AddNewQuestionModal';

export default (props: Object) =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <AddNewQuestionModal {...props} />
 </Provider>
;
