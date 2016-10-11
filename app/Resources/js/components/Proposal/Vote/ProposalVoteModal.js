import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Modal } from 'react-bootstrap';
import ProposalVoteBox from './ProposalVoteBox';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import { VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';
import { connect } from 'react-redux';
import { closeVoteModal, startVoting } from '../../../redux/modules/proposal';

const ProposalVoteModal = React.createClass({
  displayName: 'ProposalVoteModal',
  propTypes: {
    proposal: PropTypes.object.isRequired,
    step: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    showModal: PropTypes.bool.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    creditsLeft: PropTypes.number,
    user: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      user: null,
      creditsLeft: null,
    };
  },

  userHasEnoughCredits() {
    const {
      creditsLeft,
      proposal,
      user,
      // step,
    } = this.props;
    if (user && /*! proposal.userHasVoteByStepId[step.id] &&*/ creditsLeft !== null && proposal.estimation !== null) {
      return creditsLeft >= proposal.estimation;
    }
    return true;
  },

  disableSubmitButton() {
    const {
      step,
      user,
    } = this.props;
    return !step || !step.open || (user && step.voteType === VOTE_TYPE_BUDGET && !this.userHasEnoughCredits());
  },

  render() {
    const {
      dispatch,
      showModal,
      proposal,
      step,
      creditsLeft,
      isSubmitting,
      user,
    } = this.props;
    return (
      <Modal
        animation={false}
        show={showModal}
        onHide={() => { dispatch(closeVoteModal()); }}
        bsSize="small"
        aria-labelledby="contained-modal-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            { this.getIntlMessage('proposal.vote.modal.title') }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProposalVoteBox
            isSubmitting={isSubmitting}
            proposal={proposal}
            step={step}
            creditsLeft={creditsLeft}
            user={user}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton
            className="pull-right"
            onClose={() => { dispatch(closeVoteModal()); }}
          />
          <SubmitButton
            id="confirm-proposal-vote"
            onSubmit={() => { dispatch(startVoting()); }}
            label="proposal.vote.confirm"
            isSubmitting={isSubmitting}
            bsStyle={(!proposal.userHasVote || isSubmitting) ? 'success' : 'danger'}
            style={{ marginLeft: '10px' }}
            disabled={this.disableSubmitButton()}
            loginOverlay={step && step.voteType === VOTE_TYPE_BUDGET}
          />
        </Modal.Footer>
      </Modal>
    );
  },

});

const mapStateToProps = (state, props) => {
  const steps = state.project.projects[state.project.currentProjectById].steps.filter(s => s.id === props.proposal.votableStepId);
  return {
    user: state.default.user,
    showModal: !!(state.proposal.currentVoteModal && state.proposal.currentVoteModal === props.proposal.id),
    isSubmitting: !!state.proposal.isVoting,
    step: steps.length === 1 ? steps[0] : null,
  };
};

export default connect(mapStateToProps)(ProposalVoteModal);
