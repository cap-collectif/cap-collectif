import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ProposalVoteButton from './ProposalVoteButton';
import VoteButtonOverlay from './VoteButtonOverlay';
import { VOTE_TYPE_SIMPLE } from '../../../constants/ProposalConstants';

export const ProposalVoteButtonWrapper = React.createClass({
  displayName: 'ProposalVoteButtonWrapper',
  propTypes: {
    proposal: PropTypes.object.isRequired,
    userHasVote: PropTypes.bool.isRequired,
    step: PropTypes.object,
    id: PropTypes.string,
    creditsLeft: PropTypes.number,
    userVotesCount: PropTypes.number.isRequired,
    user: PropTypes.object,
    style: PropTypes.object,
    className: PropTypes.string,
  },

  getDefaultProps() {
    return {
      id: undefined,
      style: {},
      className: '',
    };
  },

  userHasEnoughCredits() {
    const { creditsLeft, proposal } = this.props;
    if (creditsLeft !== null && proposal.estimation) {
      return creditsLeft >= proposal.estimation;
    }
    return true;
  },

  render() {
    const { id, user, step, proposal, style, className, userHasVote, userVotesCount } = this.props;
    if (!step || !step.open) {
      return <span />;
    }
    if (!user) {
      return (
        <ProposalVoteButton
          id={id}
          proposal={proposal}
          step={step}
          user={user}
          style={style}
          className={className}
        />
      );
    }
    if (step.voteType === VOTE_TYPE_SIMPLE) {
      return (
        <VoteButtonOverlay
          popoverId={`vote-tooltip-proposal-${proposal.id}`}
          userHasVote={userHasVote}
          limit={step.votesLimit}
          hasReachedLimit={
            !userHasVote && step.votesLimit && step.votesLimit - userVotesCount <= 0
          }>
          <ProposalVoteButton
            id={id}
            proposal={proposal}
            step={step}
            user={user}
            style={style}
            className={className}
          />
        </VoteButtonOverlay>
      );
    }
    return (
      <VoteButtonOverlay
        popoverId={`vote-tooltip-proposal-${proposal.id}`}
        userHasVote={userHasVote}
        limit={step.votesLimit}
        hasReachedLimit={step.votesLimit && step.votesLimit - userVotesCount <= 0}
        hasUserEnoughCredits={this.userHasEnoughCredits()}>
        <ProposalVoteButton
          id={id}
          proposal={proposal}
          step={step}
          user={user}
          disabled={!userHasVote && !this.userHasEnoughCredits()}
          style={style}
          className={className}
        />
      </VoteButtonOverlay>
    );
  },
});

const mapStateToProps = (state, props) => {
  const step =
    state.project.currentProjectById && props.proposal.votableStepId
      ? state.project.projectsById[state.project.currentProjectById].stepsById[
          props.proposal.votableStepId
        ]
      : null;
  const user = state.user.user;
  return {
    user,
    userVotesCount: (user && step && state.proposal.userVotesByStepId[step.id].length) || 0,
    userHasVote:
      user && step && state.proposal.userVotesByStepId[step.id].includes(props.proposal.id),
    creditsLeft: step ? state.proposal.creditsLeftByStepId[step.id] : null,
    step,
  };
};

export default connect(mapStateToProps)(ProposalVoteButtonWrapper);
