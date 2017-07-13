// @flow
import React, { PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';

import ArgumentStore from '../../../stores/ArgumentStore';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import ArgumentActions from '../../../actions/ArgumentActions';

const ArgumentDeleteModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    argument: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      isSubmitting: false,
    };
  },

  handleSubmit() {
    const { argument, onClose } = this.props;
    this.setState({ isSubmitting: true });
    ArgumentActions.delete(ArgumentStore.opinion, argument.id)
      .then(() => {
        onClose();
        this.setState({ isSubmitting: false });
        ArgumentActions.load(ArgumentStore.opinion, argument.type);
      })
      .catch(() => {
        this.setState({ isSubmitting: false });
      });
  },

  render() {
    const { isSubmitting } = this.state;
    const { onClose, show } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={onClose}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            {<FormattedMessage id="global.removeMessage" />}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormattedHTMLMessage id="argument.delete.modal.infos" />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton
            id={'confirm-argument-delete'}
            label="global.removeDefinitively"
            isSubmitting={isSubmitting}
            onSubmit={() => {
              this.handleSubmit();
            }}
            bsStyle="danger"
          />
        </Modal.Footer>
      </Modal>
    );
  },
});

export default ArgumentDeleteModal;
