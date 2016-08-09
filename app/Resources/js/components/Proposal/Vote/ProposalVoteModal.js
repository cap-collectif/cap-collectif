import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Modal } from 'react-bootstrap';
import ProposalVoteBox from './ProposalVoteBox';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import { VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';
import { connect } from 'react-redux';

const ProposalVoteModal = React.createClass({
  displayName: 'ProposalVoteModal',
  propTypes: {
    proposal: PropTypes.object.isRequired,
    selectionStep: PropTypes.object.isRequired,
    showModal: PropTypes.bool.isRequired,
    onToggleModal: PropTypes.func.isRequired,
    userHasVote: PropTypes.bool,
    creditsLeft: PropTypes.number,
    onVoteChange: PropTypes.func,
    user: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      user: null,
      userHasVote: false,
      creditsLeft: null,
      onVoteChange: () => {},
    };
  },

  getInitialState() {
    return {
      isSubmitting: false,
    };
  },

  handleSubmit() {
    this.setState({
      isSubmitting: true,
    });
  },

  handleSubmitSuccess() {
    const { onVoteChange } = this.props;
    this.setState({
      isSubmitting: false,
    });
    this.close();
    onVoteChange();
  },

  handleSubmitFailure() {
    this.setState({
      isSubmitting: false,
    });
  },

  handleValidationFailure() {
    this.setState({
      isSubmitting: false,
    });
  },

  userHasEnoughCredits() {
    const {
      creditsLeft,
      proposal,
      user,
      userHasVote,
    } = this.props;
    if (user && !userHasVote && creditsLeft !== null && proposal.estimation !== null) {
      return creditsLeft >= proposal.estimation;
    }
    return true;
  },

  disableSubmitButton() {
    const {
      selectionStep,
      user,
    } = this.props;
    return !selectionStep.open || (user && selectionStep.voteType === VOTE_TYPE_BUDGET && !this.userHasEnoughCredits());
  },

  close() {
    const { onToggleModal } = this.props;
    onToggleModal(false);
  },

  show() {
    const { onToggleModal } = this.props;
    onToggleModal(true);
  },

  render() {
    const {
      showModal,
      proposal,
      selectionStep,
      userHasVote,
      creditsLeft,
      user,
    } = this.props;
    return (
      <Modal
        animation={false}
        show={showModal}
        onHide={this.close}
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
            proposal={proposal}
            selectionStep={selectionStep}
            userHasVote={userHasVote}
            creditsLeft={creditsLeft}
            isSubmitting={this.state.isSubmitting}
            onSubmitSuccess={this.handleSubmitSuccess}
            onSubmitFailure={this.handleSubmitFailure}
            onValidationFailure={this.handleValidationFailure}
            user={user}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton className="pull-right" onClose={this.close} />
          <SubmitButton
            id="confirm-proposal-vote"
            isSubmitting={this.state.isSubmitting}
            onSubmit={this.handleSubmit}
            label="proposal.vote.confirm"
            bsStyle={(!userHasVote || this.state.isSubmitting) ? 'success' : 'danger'}
            style={{ marginLeft: '10px' }}
            disabled={this.disableSubmitButton()}
            loginOverlay={selectionStep.voteType === VOTE_TYPE_BUDGET}
          />
        </Modal.Footer>
      </Modal>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.default.user,
  };
};

export default connect(mapStateToProps)(ProposalVoteModal);
