// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { FormattedDate, FormattedMessage } from 'react-intl';
import moment from 'moment';
import { createFragmentContainer, graphql } from 'react-relay';
import UnpublishedLabel from '../../Publishable/UnpublishedLabel';
import { type UpdateReplyModal_reply } from '~relay/UpdateReplyModal_reply.graphql';
import CloseButton from '../../Form/CloseButton';
import ReplyForm from '../Form/ReplyForm';

type Props = {
  show: boolean,
  reply: UpdateReplyModal_reply,
  onClose: () => void,
};

export class UpdateReplyModal extends React.Component<Props> {
  onChange = () => {
    const { onClose } = this.props;
    onClose();
  };

  render() {
    const { reply, show, onClose } = this.props;
    return (
      <Modal
        id={`show-reply-modal-${reply.id}`}
        className="reply__modal--show"
        animation={false}
        onHide={onClose}
        show={show}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage
              id="reply.show.link"
              values={{
                date: (
                  <FormattedDate
                    value={moment(reply.publishedAt ? reply.publishedAt : reply.createdAt)}
                    day="numeric"
                    month="long"
                    year="numeric"
                  />
                ),
                time: (
                  <FormattedDate
                    value={moment(reply.publishedAt ? reply.publishedAt : reply.createdAt)}
                    hour="numeric"
                    minute="numeric"
                  />
                ),
              }}
            />
            {/* $FlowFixMe */}
            {!reply.draft && <UnpublishedLabel publishable={reply} />}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ReplyForm questionnaire={reply.questionnaire} reply={reply} onClose={onClose} />
        </Modal.Body>
        <Modal.Footer>
          {/* $FlowFixMe $refType */}
          <CloseButton onClose={onClose} />
        </Modal.Footer>
      </Modal>
    );
  }
}

export default createFragmentContainer(UpdateReplyModal, {
  reply: graphql`
    fragment UpdateReplyModal_reply on Reply {
      ...UnpublishedLabel_publishable
      ...ReplyForm_reply
      draft
      id
      createdAt
      publishedAt
      questionnaire {
        ...ReplyForm_questionnaire
      }
    }
  `,
});
