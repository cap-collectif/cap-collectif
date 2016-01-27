import React from 'react';
import LoginStore from '../../../stores/LoginStore';
import ProposalVoteButton from './ProposalVoteButton';
import VoteButtonOverlay from './VoteButtonOverlay';
import {VOTE_TYPE_SIMPLE} from '../../../constants/ProposalConstants';
import LoginOverlay from '../../Utils/LoginOverlay';

const ProposalVoteButtonWrapper = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    selectionStepId: React.PropTypes.number,
    creditsLeft: React.PropTypes.number,
    voteType: React.PropTypes.number.isRequired,
    onClick: React.PropTypes.func.isRequired,
    userHasVote: React.PropTypes.bool.isRequired,
  },

  getDefaultProps() {
    return {
      selectionStepId: null,
      creditsLeft: null,
    };
  },

  userHasEnoughCredits() {
    if (!this.props.userHasVote && this.props.creditsLeft !== null && !!this.props.proposal.estimation) {
      return this.props.creditsLeft >= this.props.proposal.estimation;
    }
    return true;
  },

  render() {
    if (this.props.voteType === VOTE_TYPE_SIMPLE) {
      return <ProposalVoteButton {...this.props} disabled={false} />;
    }

    if (LoginStore.isLoggedIn()) {
      return (
        <VoteButtonOverlay
            tooltipId={'vote-tooltip-proposal-' + this.props.proposal.id}
            show={!this.userHasEnoughCredits()}
        >
          <ProposalVoteButton {...this.props} disabled={!this.userHasEnoughCredits()} />
        </VoteButtonOverlay>
      );
    }

    return (
      <LoginOverlay>
        <ProposalVoteButton {...this.props} disabled={false} />
      </LoginOverlay>
    );
  },

});

export default ProposalVoteButtonWrapper;
