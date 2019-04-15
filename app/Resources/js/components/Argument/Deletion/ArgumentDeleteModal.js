// @flow
import React from 'react';
import { Modal } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import AppDispatcher from '../../../dispatchers/AppDispatcher';
import DeleteArgumentMutation from '../../../mutations/DeleteArgumentMutation';
import type { ArgumentDeleteModal_argument } from '~relay/ArgumentDeleteModal_argument.graphql';

type Props = {
  show: boolean,
  argument: ArgumentDeleteModal_argument,
  onClose: () => void,
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

    return DeleteArgumentMutation.commit(
      { input: { argumentId: argument.id } },
      argument.type,
      argument.published,
    )
      .then(response => {
        if (response.deleteArgument && response.deleteArgument.deletedArgumentId) {
          AppDispatcher.dispatch({
            actionType: 'UPDATE_ALERT',
            alert: { bsStyle: 'success', content: 'alert.success.delete.argument' },
          });
          onClose();
        }
        this.setState({ isSubmitting: false });
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
            <FormattedMessage id="global.removeMessage" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormattedHTMLMessage id="argument.delete.modal.infos" />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton
            id="confirm-argument-delete"
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

export default createFragmentContainer(ArgumentDeleteModal, {
  argument: graphql`
    fragment ArgumentDeleteModal_argument on Argument {
      id
      type
      published
    }
  `,
});
