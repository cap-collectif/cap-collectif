import React from 'react';
import { Provider } from 'react-redux';
import ProposalPage from '../components/Proposal/Page/ProposalPage';
import ReactOnRails from 'react-on-rails';

export default (props) =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <ProposalPage {...props} />
 </Provider>
;
