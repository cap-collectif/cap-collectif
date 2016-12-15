import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IdeasIndexPage from '../components/Idea/Page/IdeasIndexPage';

export default props => (
   <Provider store={ReactOnRails.getStore('appStore')}>
     <IdeasIndexPage {...props} />
   </Provider>
);
