import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import ProposalVoteBasketWidget from '../components/Proposal/Vote/ProposalVoteBasketWidget';

export default props =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <ProposalVoteBasketWidget {...props} />
 </Provider>
;
