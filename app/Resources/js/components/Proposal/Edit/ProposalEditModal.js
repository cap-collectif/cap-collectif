import React from 'react';
import { IntlMixin } from 'react-intl';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import ProposalForm from '../Form/ProposalForm';
import ProposalStore from '../../../stores/ProposalStore';
import ProposalActions from '../../../actions/ProposalActions';
import { Modal } from 'react-bootstrap';

const ProposalEditModal = React.createClass({
  propTypes: {
    form: React.PropTypes.object.isRequired,
    themes: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
    proposal: React.PropTypes.object.isRequired,
    show: React.PropTypes.bool.isRequired,
    onToggleModal: React.PropTypes.func.isRequired,
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
    this.props.onToggleModal(false);
  },

  show() {
    this.props.onToggleModal(true);
  },

  handleSubmit() {
    ProposalActions.submit();
  },

  handleSubmitSuccess() {
    this.close();
  },

  handleValidationFailure() {
    ProposalActions.validationFailure();
  },

  reload() {
    this.setState(this.getInitialState());
    location.reload();
  },

  render() {
    return (
      <div>
        <Modal
          animation={false}
          show={this.props.show}
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
              form={this.props.form}
              themes={this.props.themes}
              districts={this.props.districts}
              isSubmitting={this.state.isSubmitting}
              onValidationFailure={this.handleValidationFailure.bind(null, this)}
              onSubmitSuccess={this.handleSubmitSuccess.bind(null, this)}
              mode="edit"
              proposal={this.props.proposal}
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
