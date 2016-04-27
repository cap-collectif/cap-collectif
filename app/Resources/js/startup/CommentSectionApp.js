import React from 'react';
import { Provider } from 'react-redux';
import CommentSection from '../components/Comment/CommentSection';
import ReactOnRails from 'react-on-rails';

export default (props) =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <CommentSection {...props} />
 </Provider>
;
