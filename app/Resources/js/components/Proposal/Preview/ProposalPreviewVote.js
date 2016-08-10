import React, { PropTypes } from 'react';
import ProposalActions from '../../../actions/ProposalActions';
import ProposalVoteModal from '../Vote/ProposalVoteModal';
import { VOTE_TYPE_DISABLED, VOTE_TYPE_SIMPLE } from '../../../constants/ProposalConstants';
import ProposalVoteButtonWrapper from '../Vote/ProposalVoteButtonWrapper';
import { connect } from 'react-redux';

const ProposalPreviewVote = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    step: PropTypes.object,
    creditsLeft: PropTypes.number,
    userHasVote: PropTypes.bool.isRequired,
    onVoteChange: PropTypes.func.isRequired,
    user: PropTypes.object,
  },

  getDefaultProps() {
    return {
      step: null,
      creditsLeft: null,
      user: null,
    };
  },

  getInitialState() {
    return {
      showModal: false,
    };
  },

  anonymousCanVote() {
    const { step } = this.props;
    return step && step.voteType === VOTE_TYPE_SIMPLE;
  },

  toggleModal(value) {
    this.setState({
      showModal: value,
    });
  },

  vote() {
    const {
      onVoteChange,
      proposal,
      step,
    } = this.props;
    ProposalActions
      .vote(
        step,
        proposal.id,
        proposal.estimation
      )
      .then(() => {
        onVoteChange(true);
      })
    ;
  },

  deleteVote() {
    const {
      onVoteChange,
      proposal,
      step,
    } = this.props;
    ProposalActions
        .deleteVote(
          step,
          proposal.id,
          proposal.estimation
        )
        .then(() => {
          onVoteChange(false);
        })
      ;
  },

  voteAction() {
    const {
      user,
      userHasVote,
    } = this.props;
    if (!user || !userHasVote) {
      this.toggleModal(true);
      return;
    }
    this.deleteVote();
  },

  render() {
    const {
      step,
      onVoteChange,
      creditsLeft,
      proposal,
      userHasVote,
    } = this.props;
    if (!step || step.voteType === VOTE_TYPE_DISABLED) {
      return null;
    }

    return (
      <div>
        <ProposalVoteButtonWrapper
          selectionStep={step}
          proposal={proposal}
          creditsLeft={creditsLeft}
          userHasVote={userHasVote}
          onClick={this.voteAction}
          style={{ width: '100%' }}
        />
        <ProposalVoteModal
          proposal={proposal}
          selectionStep={step}
          showModal={this.state.showModal}
          onToggleModal={this.toggleModal}
          onVoteChange={onVoteChange}
        />
      </div>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.default.user,
  };
};

export default connect(mapStateToProps)(ProposalPreviewVote);
