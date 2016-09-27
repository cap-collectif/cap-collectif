import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import ProposalForm from '../Form/ProposalForm';
import ProposalStore from '../../../stores/ProposalStore';
import ProposalActions from '../../../actions/ProposalActions';
import { Modal } from 'react-bootstrap';

const ProposalEditModal = React.createClass({
  propTypes: {
    form: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    proposal: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    onToggleModal: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      isSubmitting: false,
    };
  },

  componentWillMount() {
    ProposalStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    ProposalStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      isSubmitting: ProposalStore.isProcessing,
    });
  },

  close() {
    const { onToggleModal } = this.props;
    onToggleModal(false);
  },

  show() {
    const { onToggleModal } = this.props;
    onToggleModal(true);
  },

  handleSubmit() {
    ProposalActions.submit();
  },

  handleSubmitSuccess() {
    this.close();
    location.reload();
  },

  handleValidationFailure() {
    ProposalActions.validationFailure();
  },

  reload() {
    this.setState(this.getInitialState());
    location.reload();
  },

  render() {
    const {
      categories,
      form,
      proposal,
      show,
    } = this.props;
    return (
      <div>
        <Modal
          animation={false}
          show={show}
          onHide={this.close.bind(null, this)}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              { this.getIntlMessage('global.edit') }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ProposalForm
              form={form}
              categories={categories}
              isSubmitting={this.state.isSubmitting}
              onValidationFailure={this.handleValidationFailure.bind(null, this)}
              onSubmitSuccess={this.handleSubmitSuccess.bind(null, this)}
              mode="edit"
              proposal={proposal}
            />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={this.close.bind(null, this)} />
            <SubmitButton
              id="confirm-proposal-edit"
              isSubmitting={this.state.isSubmitting}
              onSubmit={this.handleSubmit}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  },

});

export default ProposalEditModal;
