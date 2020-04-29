// @flow
import React from 'react';
import Providers from './Providers';
import ProposalFormCreateButton, {
  type Props,
} from '../components/ProposalForm/ProposalFormCreateButton';

export default (props: Props) => (
  <Providers>
    <ProposalFormCreateButton {...props} />
  </Providers>
);
