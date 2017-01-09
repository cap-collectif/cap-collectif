import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ProposalVoteButton from './ProposalVoteButton';
import VoteButtonOverlay from './VoteButtonOverlay';
import { VOTE_TYPE_SIMPLE } from '../../../constants/ProposalConstants';
import LoginOverlay from '../../Utils/LoginOverlay';

export const ProposalVoteButtonWrapper = React.createClass({
  displayName: 'ProposalVoteButtonWrapper',
  propTypes: {
    proposal: PropTypes.object.isRequired,
    userHasVote: PropTypes.bool.isRequired,
    step: PropTypes.object,
    creditsLeft: PropTypes.number,
    user: PropTypes.object,
    style: PropTypes.object,
    className: PropTypes.string,
  },

  getDefaultProps() {
    return {
      style: {},
      className: '',
    };
  },

  userHasEnoughCredits() {
    const {
      creditsLeft,
      proposal,
    } = this.props;
    if (creditsLeft !== null && proposal.estimation) {
      return creditsLeft >= proposal.estimation;
    }
    return true;
  },

  render() {
    const { user, step, proposal, style, className, userHasVote } = this.props;
    if (!step) {
      return <div />;
    }
    if (step.voteType === VOTE_TYPE_SIMPLE && step.open) {
      return (
        <VoteButtonOverlay>
          <ProposalVoteButton
            proposal={proposal}
            step={step}
            user={user}
            style={style}
            className={className}
          />
        </VoteButtonOverlay>
      );
    }
    if (step.open) {
      if (user) {
        const notVotedAndNotEnoughCredits = !userHasVote && !this.userHasEnoughCredits();
        return (
          <VoteButtonOverlay
            popoverId={`vote-tooltip-proposal-${proposal.id}`}
            show={notVotedAndNotEnoughCredits}
          >
            <ProposalVoteButton
              proposal={proposal}
              step={step}
              user={user}
              disabled={notVotedAndNotEnoughCredits}
              style={style}
              className={className}
            />
          </VoteButtonOverlay>
        );
      }

      return (
        <LoginOverlay>
          <VoteButtonOverlay
            popoverId={`vote-tooltip-proposal-${proposal.id}`}
            // notVotedAndNotEnoughCredits={notVotedAndNotEnoughCredits}
            // notVotedAndLimitReached={notVotedAndNotEnoughCredits}
          >
            <ProposalVoteButton
              proposal={proposal}
              step={step}
              user={user}
              style={style}
              className={className}
            />
          </VoteButtonOverlay>
        </LoginOverlay>
      );
    }
  },
});

const mapStateToProps = (state, props) => {
  const step = (state.project.currentProjectById && props.proposal.votableStepId)
            ? state.project.projects[state.project.currentProjectById].steps.filter(s => s.id === props.proposal.votableStepId)[0]
            : null;
  const user = state.default.user;
  return {
    user,
    userHasVote: user && step && state.proposal.userVotesByStepId[step.id].includes(props.proposal.id),
    creditsLeft: step ? state.proposal.creditsLeftByStepId[step.id] : null,
    step,
  };
};

export default connect(mapStateToProps)(ProposalVoteButtonWrapper);
