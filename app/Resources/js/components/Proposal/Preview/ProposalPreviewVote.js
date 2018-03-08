import React, { PropTypes } from 'react';
import ProposalVoteModal from '../Vote/ProposalVoteModal';
import ProposalVoteButtonWrapper from '../Vote/ProposalVoteButtonWrapper';

const ProposalPreviewVote = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
  },

  render() {
    const { proposal } = this.props;
    return (
      <div>
        <ProposalVoteButtonWrapper
          proposal={proposal}
          id={`proposal-vote-btn-${proposal.id}`}
        />
        <ProposalVoteModal proposal={proposal} />
      </div>
    );
  },
});

export default ProposalPreviewVote;
