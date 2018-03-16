// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { FormattedDate, FormattedMessage } from 'react-intl';
import moment from 'moment';
import { createFragmentContainer, graphql } from 'react-relay';
import ResponseValue from './ResponseValue';
import { type ShowReplyModal_reply } from './__generated__/ShowReplyModal_reply.graphql';
import ReplyModalButtons from './ReplyModalButtons';
import CloseButton from '../../Form/CloseButton';

type Props = {
  show: boolean,
  reply: ShowReplyModal_reply,
  onClose: () => void,
};

export class ShowReplyModal extends React.Component<Props> {
  onChange() {
    const { onClose } = this.props;
    onClose();
  }

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
                    value={moment(reply.createdAt)}
                    day="numeric"
                    month="long"
                    year="numeric"
                  />
                ),
                time: (
                  <FormattedDate value={moment(reply.createdAt)} hour="numeric" minute="numeric" />
                ),
              }}
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reply.responses.filter(Boolean).map((response, index) => {
            return (
              <div key={index}>
                {response.question.title}
                {/* $FlowFixMe $refType */}
                <ResponseValue response={response} />
              </div>
            );
          })}
        </Modal.Body>
        <Modal.Footer>
          {/* $FlowFixMe $refType */}
          <ReplyModalButtons reply={reply} onChange={this.onChange} onClose={onClose} />
          <CloseButton onClose={onClose} />
        </Modal.Footer>
      </Modal>
    );
  }
}

export default createFragmentContainer(ShowReplyModal, {
  reply: graphql`
    fragment ShowReplyModal_reply on Reply {
      id
      createdAt
      responses {
        question {
          id
          title
        }
        ...ResponseValue_response
      }
      ...ReplyModalButtons_reply
    }
  `,
});
