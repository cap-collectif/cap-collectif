import React from 'react';
import { Provider } from 'react-redux';
import ProposalsUserVotesPage from '../components/Project/Votes/ProposalsUserVotesPage';
import ReactOnRails from 'react-on-rails';

// See documentation for https://github.com/reactjs/react-redux.
// This is how you get props from the Rails view into the redux store.
// This code here binds your smart component to the redux store.
const mainNode = (props) => {
  const store = ReactOnRails.getStore('appStore');

  return (
   <Provider store={store}>
     <ProposalsUserVotesPage {...props} />
   </Provider>
  );
};

export default mainNode;
