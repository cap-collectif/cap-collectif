import React, { PropTypes } from 'react';
import ProposalVoteModal from '../Vote/ProposalVoteModal';
import ProposalVoteButtonWrapper from '../Vote/ProposalVoteButtonWrapper';

const ProposalPreviewVote = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    step: PropTypes.object,
  },

  getDefaultProps() {
    return {
      step: null,
    };
  },

  render() {
    const {
      step,
      proposal,
    } = this.props;
    return (
      <div>
        <ProposalVoteButtonWrapper
          step={step}
          proposal={proposal}
          style={{ width: '100%' }}
        />
        <ProposalVoteModal
          proposal={proposal}
          step={step}
        />
      </div>
    );
  },

});

export default ProposalPreviewVote;
