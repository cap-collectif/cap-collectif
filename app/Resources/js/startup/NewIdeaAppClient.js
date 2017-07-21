import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import NewIdeaButton from '../components/Idea/NewIdeaButton';

export default props =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <NewIdeaButton {...props} />
 </Provider>
;
