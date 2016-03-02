import React, { PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';

import ArgumentStore from '../../../stores/ArgumentStore';
import ArgumentActions from '../../../actions/ArgumentActions';
import ArgumentForm from './ArgumentForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';

const ArgumentEditModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    argument: PropTypes.object,
    onClose: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      isSubmitting: false,
    };
  },

  handleFailure() {
    this.setState({ isSubmitting: false });
  },

  handleSubmit() {
    this.setState({ isSubmitting: true });
  },

  handleSubmitSuccess() {
    this.props.onClose();
    this.setState({ isSubmitting: false });
    ArgumentActions.load(ArgumentStore.opinion, this.props.argument.type);
  },

  render() {
    const { isSubmitting } = this.state;
    const { argument, onClose, show } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={onClose}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            {this.getIntlMessage('argument.update')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ArgumentForm
            argument={argument}
            isSubmitting={isSubmitting}
            onValidationFailure={this.handleFailure}
            onSubmitSuccess={this.handleSubmitSuccess}
            onSubmitFailure={this.handleFailure}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton
            id="confirm-argument-update"
            label="global.edit"
            isSubmitting={isSubmitting}
            onSubmit={this.handleSubmit}
          />
        </Modal.Footer>
      </Modal>
    );
  },

});

export default ArgumentEditModal;
