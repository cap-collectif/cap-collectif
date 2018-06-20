// @flow
import React, { Fragment } from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';
import { ListGroupItem } from 'react-bootstrap';
import { createFragmentContainer, graphql } from 'react-relay';
import moment from 'moment';
import type { ReplyModalLink_reply } from './__generated__/ReplyModalLink_reply.graphql';
import ShowReplyModal from './ShowReplyModal';

type Props = {
  reply: ReplyModalLink_reply,
  questionnaire: Object,
};

type State = {
  showModal: boolean,
};

export class ReplyModalLink extends React.Component<Props, State> {
  state = {
    showModal: false,
  };

  showModal = () => {
    this.setState({
      showModal: true,
    });
  };

  hideModal = () => {
    this.setState({
      showModal: false,
    });
  };

  render() {
    const { reply, questionnaire } = this.props;

    return (
      <Fragment>
        <ListGroupItem className="reply" id={`reply-link-${reply.id}`} onClick={this.showModal}>
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
          {reply.private && (
            <span>
              {' '}
              <FormattedMessage id="reply.private" />
            </span>
          )}
        </ListGroupItem>
        {/* $FlowFixMe $refType */}
        <ShowReplyModal
          show={this.state.showModal}
          onClose={this.hideModal}
          reply={reply}
          questionnaire={questionnaire}
        />
      </Fragment>
    );
  }
}

export default createFragmentContainer(ReplyModalLink, {
  reply: graphql`
    fragment ReplyModalLink_reply on Reply {
      createdAt
      id
      private
      ...ShowReplyModal_reply
    }
  `,
});
