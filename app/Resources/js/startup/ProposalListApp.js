import React from 'react';
import { Provider } from 'react-redux';
import ProposalList from '../components/Proposal/List/ProposalList';
import ReactOnRails from 'react-on-rails';

export default (props) =>
    <Provider store={ReactOnRails.getStore('appStore')}>
        <ProposalList {...props} />
    </Provider>
;
