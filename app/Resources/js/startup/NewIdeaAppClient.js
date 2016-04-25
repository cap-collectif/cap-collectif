import React from 'react';
import { Provider } from 'react-redux';
import NewIdeaButton from '../components/Idea/NewIdeaButton';
import ReactOnRails from 'react-on-rails';

export default (props) =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <NewIdeaButton {...props} />
 </Provider>
;
