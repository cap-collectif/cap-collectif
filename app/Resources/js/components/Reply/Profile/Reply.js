// @flow
import * as React from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { Media, ListGroupItem } from 'react-bootstrap';
import moment from 'moment';
import { createFragmentContainer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import type { Reply_reply } from '~relay/Reply_reply.graphql';
import type { State } from '../../../types';
import { UserAvatar } from '../../User/UserAvatar';

type ReduxProps = {|
  +isProfileEnabled: boolean,
|};

type Props = {|
  +reply: Reply_reply,
  ...ReduxProps,
|};

export class Reply extends React.Component<Props> {
  static defaultProps = {
    isProfileEnabled: false,
  };

  renderProfile({ author }: Reply_reply) {
    const { isProfileEnabled } = this.props;

    if (isProfileEnabled) {
      return <a href={author.url}>{author.username}</a>;
    }
    return <span>{author.username}</span>;
  }

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
                <span>{this.renderProfile(reply)}</span>

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
const mapStateToProps = (state: State) => ({
  isProfileEnabled: !!state.default.features.profiles,
});

const container = connect(mapStateToProps)(Reply);

export default createFragmentContainer(container, {
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
        username
        url
      }
    }
  `,
});
