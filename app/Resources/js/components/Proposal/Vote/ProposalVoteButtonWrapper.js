import React from 'react';
import LoginStore from '../../../stores/LoginStore';
import ProposalVoteButton from './ProposalVoteButton';
import VoteButtonOverlay from './VoteButtonOverlay';
import { VOTE_TYPE_SIMPLE } from '../../../constants/ProposalConstants';
import LoginOverlay from '../../Utils/LoginOverlay';

const ProposalVoteButtonWrapper = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    selectionStep: React.PropTypes.object,
    creditsLeft: React.PropTypes.number,
    voteType: React.PropTypes.number.isRequired,
    onClick: React.PropTypes.func.isRequired,
    userHasVote: React.PropTypes.bool.isRequired,
  },

  getDefaultProps() {
    return {
      selectionStep: null,
      creditsLeft: null,
    };
  },

  selectionStepIsOpen() {
    return this.props.selectionStep && this.props.selectionStep.isOpen;
  },

  userHasEnoughCredits() {
    if (!this.props.userHasVote && this.props.creditsLeft !== null && !!this.props.proposal.estimation) {
      return this.props.creditsLeft >= this.props.proposal.estimation;
    }
    return true;
  },

  render() {
    if (this.props.voteType === VOTE_TYPE_SIMPLE) {
      return (
        <ProposalVoteButton
          {...this.props}
          disabled={!this.selectionStepIsOpen()}
        />
      );
    }

    if (LoginStore.isLoggedIn()) {
      return (
        <VoteButtonOverlay
            tooltipId={'vote-tooltip-proposal-' + this.props.proposal.id}
            show={!this.userHasEnoughCredits()}
        >
          <ProposalVoteButton
            {...this.props}
            disabled={!this.selectionStepIsOpen() || !this.userHasEnoughCredits()}
          />
        </VoteButtonOverlay>
      );
    }

    return (
      <LoginOverlay>
        <ProposalVoteButton
          {...this.props}
          disabled={!this.selectionStepIsOpen()}
        />
      </LoginOverlay>
    );
  },

});

export default ProposalVoteButtonWrapper;
