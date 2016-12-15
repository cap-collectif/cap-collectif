import React from 'react';
import { Provider } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import ProposalList from '../components/Proposal/List/ProposalList';

export default props =>
    <Provider store={ReactOnRails.getStore('appStore')}>
        <ProposalList {...props} />
    </Provider>
;
