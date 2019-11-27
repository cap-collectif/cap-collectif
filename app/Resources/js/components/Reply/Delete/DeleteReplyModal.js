// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { Modal } from 'react-bootstrap';
import type { DeleteReplyModal_reply } from '~relay/DeleteReplyModal_reply.graphql';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import AppDispatcher from '../../../dispatchers/AppDispatcher';
import DeleteReplyMutation from '../../../mutations/DeleteReplyMutation';
import { UPDATE_ALERT } from '../../../constants/AlertConstants';

type Props = {
  reply: DeleteReplyModal_reply,
  show: boolean,
  onClose: () => void,
};

type State = {
  isSubmitting: boolean,
};

export class DeleteReplyModal extends React.Component<Props, State> {
  state = { isSubmitting: false };

  handleSubmit = () => {
    const { reply, onClose } = this.props;

    this.setState({ isSubmitting: true });
    DeleteReplyMutation.commit({ input: { id: reply.id }, isAuthenticated: true })
      .then(() => {
        onClose();
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'reply.request.delete.success' },
        });
        this.setState({ isSubmitting: false });
      })
      .catch(() => {
        this.setState({ isSubmitting: false });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'warning', content: 'global.failure' },
        });
      });
  };

  render() {
    const { reply, show, onClose } = this.props;
    const { isSubmitting } = this.state;
    return (
      <div>
        <Modal
          id={`delete-reply-modal-${reply.id}`}
          className="reply__modal--delete"
          animation={false}
          show={show}
          onHide={onClose}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              {<FormattedMessage id="global.delete" />}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{<FormattedMessage id="reply.delete.confirm" />}</p>
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={onClose} />
            <SubmitButton
              id={`reply-confirm-delete-button${reply.id}`}
              className="reply__confirm-delete-btn"
              isSubmitting={isSubmitting}
              onSubmit={this.handleSubmit}
              label="global.delete"
              bsStyle="danger"
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default createFragmentContainer(DeleteReplyModal, {
  reply: graphql`
    fragment DeleteReplyModal_reply on Reply {
      id
      questionnaire {
        id
      }
    }
  `,
});
