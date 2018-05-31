// @flow
import React from 'react';
import ProposalVoteModal from '../Vote/ProposalVoteModal';
import ProposalVoteButtonWrapper from '../Vote/ProposalVoteButtonWrapper';
import type { Proposal } from '../../../redux/modules/proposal';

type Props = {
  proposal: Proposal,
};

export class ProposalPreviewVote extends React.Component<Props> {
  render() {
    const { proposal } = this.props;
    return (
      <span>
        <ProposalVoteButtonWrapper
          proposal={proposal}
          style={{ width: '100%' }}
          id={`proposal-vote-btn-${proposal.id}`}
          className="proposal__preview__vote"
        />
        <ProposalVoteModal proposal={proposal} />
      </span>
    );
  }
}

export default ProposalPreviewVote;
