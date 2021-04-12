// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { Modal } from 'react-bootstrap';
import type { DeleteReplyModal_reply } from '~relay/DeleteReplyModal_reply.graphql';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import AppDispatcher from '~/dispatchers/AppDispatcher';
import DeleteReplyMutation from '~/mutations/DeleteReplyMutation';
import { UPDATE_ALERT } from '~/constants/AlertConstants';

type Props = {|
  +reply: DeleteReplyModal_reply,
  +show: boolean,
  +onClose: () => void,
|};

export const DeleteReplyModal = ({ reply, onClose, show }: Props) => {
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const intl = useIntl();

  const handleSubmit = () => {
    setIsSubmitting(true);

    DeleteReplyMutation.commit({ input: { id: reply.id }, isAuthenticated: true })
      .then(() => {
        onClose();
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'reply.request.delete.success' },
        });
        setIsSubmitting(false);
      })
      .catch(() => {
        setIsSubmitting(false);
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'warning', content: 'global.failure' },
        });
      });
  };

  return (
    <Modal
      id={`delete-reply-modal-${reply.id}`}
      className="reply__modal--delete"
      animation={false}
      show={show}
      onHide={onClose}
      bsSize="large"
      aria-labelledby="contained-modal-title-lg">
      <Modal.Header closeButton closeLabel={intl.formatMessage({ id: 'close.modal' })}>
        <Modal.Title id="contained-modal-title-lg">
          <FormattedMessage id="global.delete" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormattedMessage id="reply.delete.confirm" tagName="p" />
      </Modal.Body>
      <Modal.Footer>
        <CloseButton onClose={onClose} />
        <SubmitButton
          id={`reply-confirm-delete-button${reply.id}`}
          className="reply__confirm-delete-btn"
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          label="global.delete"
          bsStyle="danger"
        />
      </Modal.Footer>
    </Modal>
  );
};

export default createFragmentContainer(DeleteReplyModal, {
  reply: graphql`
    fragment DeleteReplyModal_reply on Reply {
      id
    }
  `,
});
