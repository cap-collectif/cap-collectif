// @flow
import React, { Fragment } from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';
import { ListGroupItem, Button } from 'react-bootstrap';
import { createFragmentContainer, graphql } from 'react-relay';
import moment from 'moment';
import type { ReplyModalLink_reply } from './__generated__/ReplyModalLink_reply.graphql';
import UpdateReplyModal from './UpdateReplyModal';
import ReplyDraftLabel from './ReplyDraftLabel';
import UnpublishedLabel from '../../Publishable/UnpublishedLabel';
import DeleteReplyModal from '../Delete/DeleteReplyModal';

type Props = {
  reply: ReplyModalLink_reply,
  questionnaire: Object,
};

type CurrentOpenModal = 'edit' | 'delete' | null;

type State = {
  currentOpenModal: CurrentOpenModal,
};

export class ReplyModalLink extends React.Component<Props, State> {
  state = {
    currentOpenModal: null,
  };

  showModal = (modal: CurrentOpenModal) => {
    this.setState({ currentOpenModal: modal });
  };

  hideModal = () => {
    this.setState({ currentOpenModal: null });
  };

  render() {
    const { reply, questionnaire } = this.props;

    return (
      <Fragment>
        <ListGroupItem className="reply align-items-center" id={`reply-link-${reply.id}`}>
          <div>
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
                  <FormattedDate value={moment(reply.createdAt)} hour="numeric" minute="numeric" />
                ),
              }}
            />
            {reply.private && (
              <span>
                {' '}
                <FormattedMessage id="reply.private" />
              </span>
            )}
            {/* $FlowFixMe $refType */}
            <ReplyDraftLabel status={reply.publicationStatus} />
            <UnpublishedLabel publishable={reply} />
          </div>
          <div>
            <Button
              className="mr-10 reply__update-btn"
              bsStyle="warning"
              onClick={() => this.showModal('edit')}>
              <FormattedMessage id="glodal.edit" />
            </Button>
            <Button bsStyle="danger reply__delete-btn" onClick={() => this.showModal('delete')}>
              <FormattedMessage id="glodal.delete" />
            </Button>
          </div>
        </ListGroupItem>
        {/* $FlowFixMe $refType */}
        <UpdateReplyModal
          show={this.state.currentOpenModal === 'edit'}
          onClose={this.hideModal}
          reply={reply}
          questionnaire={questionnaire}
        />
        {/* $FlowFixMe $refType */}
        <DeleteReplyModal
          reply={reply}
          show={this.state.currentOpenModal === 'delete'}
          onClose={this.hideModal}
        />
      </Fragment>
    );
  }
}

export default createFragmentContainer(ReplyModalLink, {
  reply: graphql`
    fragment ReplyModalLink_reply on Reply {
      createdAt
      publishedAt
      id
      private
      publicationStatus
      ...UpdateReplyModal_reply
      ...DeleteReplyModal_reply
      ...UnpublishedLabel_publishable
    }
  `,
});
