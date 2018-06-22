// @flow
import React from 'react';
import { Modal } from 'react-bootstrap';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';

import ArgumentStore from '../../../stores/ArgumentStore';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import ArgumentActions from '../../../actions/ArgumentActions';

type Props = {
  show: boolean,
  argument: Object,
  onClose: Function,
};

type State = {
  isSubmitting: boolean,
};

class ArgumentDeleteModal extends React.Component<Props, State> {
  state = {
    isSubmitting: false,
  };

  handleSubmit = () => {
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
  };

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
  }
}

export default ArgumentDeleteModal;
