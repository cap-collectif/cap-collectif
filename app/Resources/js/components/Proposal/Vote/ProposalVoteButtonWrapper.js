import React, { PropTypes } from 'react';
import ProposalVoteButton from './ProposalVoteButton';
import VoteButtonOverlay from './VoteButtonOverlay';
import { VOTE_TYPE_SIMPLE } from '../../../constants/ProposalConstants';
import LoginOverlay from '../../Utils/LoginOverlay';
import { connect } from 'react-redux';

const ProposalVoteButtonWrapper = React.createClass({
  displayName: 'ProposalVoteButtonWrapper',
  propTypes: {
    proposal: PropTypes.object.isRequired,
    selectionStep: PropTypes.object,
    creditsLeft: PropTypes.number,
    onClick: PropTypes.func.isRequired,
    userHasVote: PropTypes.bool.isRequired,
    user: PropTypes.object,
    style: PropTypes.object,
    className: PropTypes.string,
  },

  getDefaultProps() {
    return {
      selectionStep: null,
      creditsLeft: null,
      user: null,
      style: {},
      className: '',
    };
  },

  selectionStepIsOpen() {
    const { selectionStep } = this.props;
    return selectionStep && selectionStep.open;
  },

  voteThresholdReached() {
    const { selectionStep, proposal } = this.props;
    return selectionStep && selectionStep.voteThreshold <= proposal.votesCount;
  },

  userHasEnoughCredits() {
    const {
      creditsLeft,
      proposal,
      userHasVote,
    } = this.props;
    if (!userHasVote && creditsLeft !== null && !!proposal.estimation) {
      return creditsLeft >= proposal.estimation;
    }
    return true;
  },

  render() {
    const { user, selectionStep, userHasVote, onClick, proposal, style, className } = this.props;
    if (selectionStep && selectionStep.voteType === VOTE_TYPE_SIMPLE) {
      return (
        <ProposalVoteButton
          userHasVote={userHasVote}
          onClick={onClick}
          disabled={!this.selectionStepIsOpen() || (selectionStep.voteThreshold > 0 && this.voteThresholdReached())}
          style={style}
          className={className}
        />
      );
    }

    if (user) {
      return (
        <VoteButtonOverlay
            popoverId={`vote-tooltip-proposal-${proposal.id}`}
            show={!this.userHasEnoughCredits()}
        >
          <ProposalVoteButton
            userHasVote={userHasVote}
            onClick={this.userHasEnoughCredits() ? onClick : null}
            disabled={!this.selectionStepIsOpen() || !this.userHasEnoughCredits()}
            style={style}
            className={className}
          />
        </VoteButtonOverlay>
      );
    }

    return (
      <LoginOverlay>
        <ProposalVoteButton
          userHasVote={userHasVote}
          onClick={null}
          disabled={!this.selectionStepIsOpen()}
          style={style}
          className={className}
        />
      </LoginOverlay>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.default.user,
  };
};

export default connect(mapStateToProps)(ProposalVoteButtonWrapper);
