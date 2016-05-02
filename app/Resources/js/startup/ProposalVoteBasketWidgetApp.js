import React from 'react';
import { Provider } from 'react-redux';
import ProposalVoteBasketWidget from '../components/Proposal/Vote/ProposalVoteBasketWidget';
import ReactOnRails from 'react-on-rails';

export default (props) =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <ProposalVoteBasketWidget {...props} />
 </Provider>
;
