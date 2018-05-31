// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { Modal } from 'react-bootstrap';
import type { ReplyDeleteModal_reply } from './__generated__/ReplyDeleteModal_reply.graphql';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import AppDispatcher from '../../../dispatchers/AppDispatcher';
import DeleteReplyMutation from '../../../mutations/DeleteReplyMutation';
import { UPDATE_ALERT } from '../../../constants/AlertConstants';

type Props = {
  reply: ReplyDeleteModal_reply,
  show: boolean,
  onToggleModal: (value: boolean) => void,
  onDelete: () => void,
};

type State = {
  isSubmitting: boolean,
};

export class ReplyDeleteModal extends React.Component<Props, State> {
  state = {
    isSubmitting: false,
  };

  handleSubmit = () => {
    const { onDelete, reply } = this.props;

    this.setState({ isSubmitting: true });
    DeleteReplyMutation.commit({ input: { id: reply.id } })
      .then(() => {
        this.close();
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'reply.request.delete.success' },
        });
        onDelete();
      })
      .catch(() => {
        this.setState({ isSubmitting: false });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'warning', content: 'reply.request.delete.failure' },
        });
      });
  };

  close = () => {
    const { onToggleModal } = this.props;
    onToggleModal(false);
  };

  show = () => {
    const { onToggleModal } = this.props;
    onToggleModal(true);
  };

  render() {
    const { reply, show } = this.props;
    return (
      <div>
        <Modal
          id={`delete-reply-modal-${reply.id}`}
          className="reply__modal--delete"
          animation={false}
          show={show}
          onHide={this.close}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              {<FormattedMessage id="global.remove" />}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{<FormattedMessage id="reply.delete.confirm" />}</p>
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={this.close} />
            <SubmitButton
              id={`reply-confirm-delete-button${reply.id}`}
              className="reply__confirm-delete-btn"
              isSubmitting={this.state.isSubmitting}
              onSubmit={this.handleSubmit}
              label="global.remove"
              bsStyle="danger"
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default createFragmentContainer(ReplyDeleteModal, {
  reply: graphql`
    fragment ReplyDeleteModal_reply on Reply {
      id
      questionnaire {
        id
      }
    }
  `,
});
