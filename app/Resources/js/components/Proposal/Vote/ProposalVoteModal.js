import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'react-bootstrap';
import { submit, isValid } from 'redux-form';
import { connect } from 'react-redux';
import ProposalVoteBox from './ProposalVoteBox';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import { VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';
import { closeVoteModal } from '../../../redux/modules/proposal';

const ProposalVoteModal = React.createClass({
  displayName: 'ProposalVoteModal',

  propTypes: {
    proposal: PropTypes.object.isRequired,
    step: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    showModal: PropTypes.bool.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    valid: PropTypes.bool.isRequired,
    creditsLeft: PropTypes.number,
    user: PropTypes.object,
    voteWithoutAccount: PropTypes.bool.isRequired,
  },

  getDefaultProps() {
    return {
      user: null,
      creditsLeft: null,
    };
  },

  userHasEnoughCredits() {
    const { creditsLeft, proposal, user } = this.props;
    if (user && creditsLeft !== null && proposal.estimation !== null) {
      return creditsLeft >= proposal.estimation;
    }
    return true;
  },

  disableSubmitButton() {
    const { step, user } = this.props;
    return (
      !step ||
      !step.open ||
      (user && step.voteType === VOTE_TYPE_BUDGET && !this.userHasEnoughCredits())
    );
  },

  render() {
    const {
      dispatch,
      showModal,
      proposal,
      step,
      creditsLeft,
      isSubmitting,
      valid,
      user,
      voteWithoutAccount,
    } = this.props;
    return (
      <Modal
        animation={false}
        show={showModal}
        onHide={() => {
          dispatch(closeVoteModal());
        }}
        bsSize="small"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            {<FormattedMessage id="proposal.vote.modal.title" />}
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
            onClose={() => {
              dispatch(closeVoteModal());
            }}
          />
          {(voteWithoutAccount || user) && (
              <SubmitButton
                id="confirm-proposal-vote"
                onSubmit={() => {
                  dispatch(submit('proposalVote'));
                }}
                label="proposal.vote.confirm"
                isSubmitting={valid && isSubmitting}
                bsStyle={!proposal.userHasVote || isSubmitting ? 'success' : 'danger'}
                style={{ marginLeft: '10px' }}
                disabled={this.disableSubmitButton()}
                loginOverlay={step && step.voteType === VOTE_TYPE_BUDGET}
              />
            )}
        </Modal.Footer>
      </Modal>
    );
  },
});

const mapStateToProps = (state, props) => {
  const steps = state.project.currentProjectById
    ? state.project.projectsById[state.project.currentProjectById].steps.filter(
        s => s.id === props.proposal.votableStepId,
      )
    : [];
  return {
    user: state.user.user,
    showModal: !!(
      state.proposal.currentVoteModal && state.proposal.currentVoteModal === props.proposal.id
    ),
    isSubmitting: !!state.proposal.isVoting,
    valid: isValid('proposalVote')(state),
    step: steps.length === 1 ? steps[0] : null,
    voteWithoutAccount: state.default.features.vote_without_account,
  };
};

export default connect(mapStateToProps)(ProposalVoteModal);
