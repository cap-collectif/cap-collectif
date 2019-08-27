// @flow
import * as React from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { Media, ListGroupItem } from 'react-bootstrap';
import moment from 'moment';
import { createFragmentContainer, graphql } from 'react-relay';
import type { Reply_reply } from '~relay/Reply_reply.graphql';
import { UserAvatar } from '../../User/UserAvatar';
import UserLink from '../../User/UserLink';

type Props = {|
  +reply: Reply_reply,
|};

export class Reply extends React.Component<Props> {
  renderTitle({ questionnaire }: Reply_reply) {
    if (questionnaire.step) {
      return <a href={questionnaire.step.url}>{questionnaire.title}</a>;
    }
    return <span>{questionnaire.title}</span>;
  }

  render() {
    const { reply } = this.props;
    return (
      <ListGroupItem
        className="list-group-item__opinion opinion mb-20 mt-20"
        id={`reply-${reply.id}`}>
        <Media>
          <Media.Left>
            {/* $FlowFixMe $refType */}
            <UserAvatar user={reply.author} />
          </Media.Left>

          <Media.Body className="opinion__body">
            <div className="opinion__data">
              <p className="h5">
                <UserLink user={reply.author} />

                <span className="ml-5 mr-5">
                  <FormattedMessage id="reply.has_replied" />
                </span>

                <span>{this.renderTitle(reply)}</span>
              </p>

              <span className="excerpt opinion__date">
                <FormattedDate
                  value={moment(reply.createdAt)}
                  day="numeric"
                  month="long"
                  year="numeric"
                  hour="numeric"
                  minute="numeric"
                />
              </span>
            </div>
          </Media.Body>
        </Media>
      </ListGroupItem>
    );
  }
}

export default createFragmentContainer(Reply, {
  reply: graphql`
    fragment Reply_reply on Reply
      @argumentDefinitions(isAuthenticated: { type: "Boolean!", defaultValue: true }) {
      id
      createdAt
      questionnaire {
        title
        step {
          url
        }
      }
      author {
        ...UserAvatar_user
        ...UserLink_user
        username
        url
      }
    }
  `,
});
