import React from 'react';
import LoginStore from '../../../stores/LoginStore';
import ProposalActions from '../../../actions/ProposalActions';
import ProposalVoteModal from '../Vote/ProposalVoteModal';
import {VOTE_TYPE_DISABLED, VOTE_TYPE_SIMPLE} from '../../../constants/ProposalConstants';
import ProposalVoteButtonWrapper from '../Vote/ProposalVoteButtonWrapper';

const ProposalPreviewVote = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    selectionStepId: React.PropTypes.number,
    creditsLeft: React.PropTypes.number,
    voteType: React.PropTypes.number.isRequired,
    userHasVote: React.PropTypes.bool.isRequired,
    onVoteChange: React.PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      selectionStepId: null,
      creditsLeft: null,
    };
  },

  getInitialState() {
    return {
      showModal: false,
    };
  },

  anonymousCanVote() {
    return this.props.selectionStepId && this.props.voteType === VOTE_TYPE_SIMPLE;
  },

  toggleModal(value) {
    this.setState({
      showModal: value,
    });
  },

  vote() {
    ProposalActions
      .vote(
        this.props.selectionStepId,
        this.props.proposal.id,
        this.props.proposal.estimation
      )
      .then(() => {
        this.props.onVoteChange(true);
      })
    ;
  },

  deleteVote() {
    ProposalActions
      .deleteVote(
        this.props.selectionStepId,
        this.props.proposal.id,
        this.props.proposal.estimation
      )
      .then(() => {
        this.props.onVoteChange(false);
      })
    ;
  },

  voteAction() {
    if (!LoginStore.isLoggedIn()) {
      this.toggleModal(true);
      return;
    }
    if (this.props.userHasVote) {
      this.deleteVote();
    } else {
      this.vote();
    }
  },

  render() {
    if (!this.props.selectionStepId || this.props.voteType === VOTE_TYPE_DISABLED) {
      return null;
    }

    return (
      <div>
        <ProposalVoteButtonWrapper {...this.props} onClick={this.voteAction} />
        {
          !LoginStore.isLoggedIn() && this.anonymousCanVote()
            ? <ProposalVoteModal
                proposal={this.props.proposal}
                selectionStepId={this.props.selectionStepId}
                showModal={this.state.showModal}
                onToggleModal={this.toggleModal}
            />
            : null
        }
      </div>
    );
  },

});

export default ProposalPreviewVote;
