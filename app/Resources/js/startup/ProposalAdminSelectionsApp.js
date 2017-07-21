import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import ProposalAdminSelections from '../components/Proposal/Admin/ProposalAdminSelections';

export default props =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <ProposalAdminSelections {...props} />
 </Provider>
;
