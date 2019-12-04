// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import CommentInfos from './CommentInfos';
import CommentBody from './CommentBody';
import CommentDate from './CommentDate';
import CommentVoteButton from './CommentVoteButton';
import type { ProfileComment_comment } from '~relay/ProfileComment_comment.graphql';
import UserAvatar from '../User/UserAvatar';

type RelayProps = {|
  +comment: ProfileComment_comment,
|};

type Props = {|
  ...RelayProps,
|};

export class ProfileComment extends React.Component<Props> {
  render() {
    const { comment } = this.props;
    return (
      <li className="opinion bg-white block block--bordered box">
        <div className="opinion__body">
          <div className="opinion__content">
            <UserAvatar user={comment.author} />
            <div className="comment__detail">
              <div id={`comment_${comment.id}`}>
                <div className="opinion__data">
                  <CommentInfos comment={comment} />
                </div>
                <CommentBody comment={comment} />
              </div>
              <div className="comment__action">
                <CommentDate comment={comment} />
                <div className="comment__buttons">
                  <CommentVoteButton comment={comment} />{' '}
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  }
}

export default createFragmentContainer(ProfileComment, {
  comment: graphql`
    fragment ProfileComment_comment on Comment
      @argumentDefinitions(isAuthenticated: { type: "Boolean!", defaultValue: false }) {
      id
      author {
        ...UserAvatar_user
      }
      ...CommentVoteButton_comment
      ...CommentDate_comment
      ...CommentInfos_comment
      ...CommentBody_comment
    }
  `,
});
