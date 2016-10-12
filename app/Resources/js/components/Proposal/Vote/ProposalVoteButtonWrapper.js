import React, { PropTypes } from 'react';
import ProposalVoteButton from './ProposalVoteButton';
import VoteButtonOverlay from './VoteButtonOverlay';
import { VOTE_TYPE_SIMPLE } from '../../../constants/ProposalConstants';
import LoginOverlay from '../../Utils/LoginOverlay';
import { connect } from 'react-redux';

export const ProposalVoteButtonWrapper = React.createClass({
  displayName: 'ProposalVoteButtonWrapper',
  propTypes: {
    proposal: PropTypes.object.isRequired,
    step: PropTypes.object,
    creditsLeft: PropTypes.number,
    user: PropTypes.object,
    style: PropTypes.object,
    className: PropTypes.string,
  },

  getDefaultProps() {
    return {
      creditsLeft: null,
      user: null,
      style: {},
      className: '',
    };
  },

  voteThresholdReached() {
    const { step, proposal } = this.props;
    return step && step.voteThreshold <= proposal.votesCount;
  },

  userHasEnoughCredits() {
    const {
      creditsLeft,
      proposal,
    } = this.props;
    if (!proposal.userHasVote && creditsLeft !== null && !!proposal.estimation) {
      return creditsLeft >= proposal.estimation;
    }
    return true;
  },

  render() {
    const { user, step, proposal, style, className } = this.props;
    if (step && step.voteType === VOTE_TYPE_SIMPLE) {
      return (
        <ProposalVoteButton
          proposal={proposal}
          step={step}
          user={user}
          disabled={!step.open}
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
            proposal={proposal}
            step={step}
            user={user}
            disabled={!(step && step.open) || !this.userHasEnoughCredits()}
            style={style}
            className={className}
          />
        </VoteButtonOverlay>
      );
    }

    return (
      <LoginOverlay>
        <ProposalVoteButton
          proposal={proposal}
          step={step}
          user={user}
          disabled={!(step && step.open)}
          style={style}
          className={className}
        />
      </LoginOverlay>
    );
  },

});

const mapStateToProps = (state, props) => {
  return {
    user: state.default.user,
    step: props.proposal.votableStepId
      ? state.project.projects[state.project.currentProjectById].steps.filter(step => step.id === props.proposal.votableStepId)[0]
      : null,
  };
};

export default connect(mapStateToProps)(ProposalVoteButtonWrapper);
