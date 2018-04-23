// @flow
import * as React from 'react';
import ProposalVoteForm from './ProposalVoteForm';

type Props = {
  proposal: Object,
  step: Object,
};

class ProposalVoteBox extends React.Component<Props> {
  render() {
    const { proposal, step } = this.props;
    return (
      <div id="proposal-vote-box">
        <div>
          <ProposalVoteForm proposal={proposal} step={step} />
        </div>
      </div>
    );
  }
}

export default ProposalVoteBox;
