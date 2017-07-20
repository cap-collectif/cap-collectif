import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import ProposalStepPage from '../components/Page/ProposalStepPage';

const mainNode = (props) => {
  const store = ReactOnRails.getStore('appStore');

  return (
   <Provider store={store}>
     <ProposalStepPage {...props} />
   </Provider>
  );
};

export default mainNode;
