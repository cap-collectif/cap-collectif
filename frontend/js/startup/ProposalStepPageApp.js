// @flow
import React from 'react';
import Providers from './Providers';
import ProposalStepPage from '../components/Page/ProposalStepPage';

type Props = {|
  +stepId: string,
  +count: number,
|};

const mainNode = (props: Props) => {
  return (
    <Providers>
      {/* $FlowFixMe  */}
      <ProposalStepPage {...props} />
    </Providers>
  );
};

export default mainNode;
