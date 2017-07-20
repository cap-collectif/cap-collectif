import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import CommentSection from '../components/Comment/CommentSection';

export default props =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <CommentSection {...props} />
 </Provider>
;
