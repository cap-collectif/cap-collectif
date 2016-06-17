import React from 'react';
import { IntlMixin } from 'react-intl';
import ProposalCreateButton from './ProposalCreateButton';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import ProposalForm from '../Form/ProposalForm';
import ProposalActions from '../../../actions/ProposalActions';
import ProposalStore from '../../../stores/ProposalStore';
import { Modal } from 'react-bootstrap';

const ProposalCreate = React.createClass({
  propTypes: {
    form: React.PropTypes.object.isRequired,
    themes: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      showModal: false,
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

  handleSubmit() {
    ProposalActions.submit();
  },

  handleSubmitSuccess() {
    this.close();
    ProposalActions.load('form', this.props.form.id);
  },

  handleValidationFailure() {
    ProposalActions.validationFailure();
  },

  close() {
    this.setState({ showModal: false });
  },

  show() {
    this.setState({ showModal: true });
  },

  render() {
    return (
      <div>
        <ProposalCreateButton disabled={!this.props.form.isContribuable} handleClick={this.show.bind(null, this)} />
        <Modal
          animation={false}
          show={this.state.showModal}
          onHide={this.close.bind(null, this)}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              { this.getIntlMessage('proposal.add') }
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
            />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={this.close.bind(null, this)} />
            <SubmitButton
              id="confirm-proposal-create"
              isSubmitting={this.state.isSubmitting}
              onSubmit={this.handleSubmit.bind(null, this)}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  },

});

export default ProposalCreate;
