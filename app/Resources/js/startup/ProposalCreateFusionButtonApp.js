import React from 'react';
import { Provider } from 'react-redux';
import ProposalCreateFusionButton from '../components/Proposal/Create/ProposalCreateFusionButton';
import ReactOnRails from 'react-on-rails';

export default props =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <ProposalCreateFusionButton {...props} />
 </Provider>
;
