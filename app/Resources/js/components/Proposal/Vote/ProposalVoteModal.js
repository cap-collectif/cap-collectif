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
    this.setState({
      isSubmitting: false,
    });
    this.close();
    this.props.onVoteChange();
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
    if (this.props.user && !this.props.userHasVote && this.props.creditsLeft !== null && this.props.proposal.estimation !== null) {
      return this.props.creditsLeft >= this.props.proposal.estimation;
    }
    return true;
  },

  disableSubmitButton() {
    return !this.props.selectionStep.open || (this.props.user && this.props.selectionStep.voteType === VOTE_TYPE_BUDGET && !this.userHasEnoughCredits());
  },

  close() {
    this.props.onToggleModal(false);
  },

  show() {
    this.props.onToggleModal(true);
  },

  render() {
    const { showModal, proposal, selectionStep, userHasVote, creditsLeft } = this.props;
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
            user={this.props.user}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton className="pull-right" onClose={this.close} />
          <SubmitButton
            id="confirm-proposal-vote"
            isSubmitting={this.state.isSubmitting}
            onSubmit={this.handleSubmit}
            label="proposal.vote.confirm"
            bsStyle={(!this.props.userHasVote || this.state.isSubmitting) ? 'success' : 'danger'}
            style={{ marginLeft: '10px' }}
            disabled={this.disableSubmitButton()}
            loginOverlay={this.props.selectionStep.voteType === VOTE_TYPE_BUDGET}
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
