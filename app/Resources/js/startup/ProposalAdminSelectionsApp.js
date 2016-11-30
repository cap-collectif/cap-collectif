import React from 'react';
import { Provider } from 'react-redux';
import ProposalAdminSelections from '../components/Proposal/Admin/ProposalAdminSelections';
import ReactOnRails from 'react-on-rails';

export default props =>
 <Provider store={ReactOnRails.getStore('appStore')}>
   <ProposalAdminSelections {...props} />
 </Provider>
;
