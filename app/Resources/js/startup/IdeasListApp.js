import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import IdeasList from '../components/Idea/List/IdeasList';

const mainNode = (props) => {
  const store = ReactOnRails.getStore('appStore');

  return (
   <Provider store={store}>
     <IdeasList {...props} />
   </Provider>
  );
};

export default mainNode;
