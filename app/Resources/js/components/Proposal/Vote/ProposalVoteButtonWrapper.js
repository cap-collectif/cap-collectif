import React, { PropTypes } from 'react';
import ProposalVoteButton from './ProposalVoteButton';
import VoteButtonOverlay from './VoteButtonOverlay';
import { VOTE_TYPE_SIMPLE } from '../../../constants/ProposalConstants';
import LoginOverlay from '../../Utils/LoginOverlay';
import { connect } from 'react-redux';

const ProposalVoteButtonWrapper = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    selectionStep: PropTypes.object,
    creditsLeft: PropTypes.number,
    onClick: PropTypes.func.isRequired,
    userHasVote: PropTypes.bool.isRequired,
    user: PropTypes.object,
    features: PropTypes.object.isRequired,
  },

  getDefaultProps() {
    return {
      selectionStep: null,
      creditsLeft: null,
      user: null,
    };
  },

  selectionStepIsOpen() {
    return this.props.selectionStep && this.props.selectionStep.open;
  },

  userHasEnoughCredits() {
    if (!this.props.userHasVote && this.props.creditsLeft !== null && !!this.props.proposal.estimation) {
      return this.props.creditsLeft >= this.props.proposal.estimation;
    }
    return true;
  },

  render() {
    const { user, features, selectionStep, userHasVote, onClick, proposal } = this.props;
    if (selectionStep && selectionStep.voteType === VOTE_TYPE_SIMPLE) {
      return (
        <ProposalVoteButton
          userHasVote={userHasVote}
          onClick={onClick}
          disabled={!this.selectionStepIsOpen()}
        />
      );
    }

    if (user) {
      return (
        <VoteButtonOverlay
            tooltipId={'vote-tooltip-proposal-' + proposal.id}
            show={!this.userHasEnoughCredits()}
        >
          <ProposalVoteButton
            userHasVote={userHasVote}
            onClick={onClick}
            disabled={!this.selectionStepIsOpen() || !this.userHasEnoughCredits()}
          />
        </VoteButtonOverlay>
      );
    }

    return (
      <LoginOverlay user={user} features={features}>
        <ProposalVoteButton
          userHasVote={userHasVote}
          onClick={onClick}
          disabled={!this.selectionStepIsOpen()}
        />
      </LoginOverlay>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.default.user,
    features: state.default.features,
  };
};

export default connect(mapStateToProps)(ProposalVoteButtonWrapper);
