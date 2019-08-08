// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import UserAvatarDeprecated from '../User/UserAvatarDeprecated';
import CommentInfos from './CommentInfos';
import CommentBody from './CommentBody';
import CommentDate from './CommentDate';
import CommentVoteButton from './CommentVoteButton';
import type { ProfileComment_comment } from '~relay/ProfileComment_comment.graphql';

type RelayProps = {|
  +comment: ProfileComment_comment,
|};

type Props = {|
  ...RelayProps,
|};

class ProfileComment extends React.Component<Props> {
  render() {
    const { comment } = this.props;
    return (
      <li className="opinion opinion--comment block block--bordered box">
        <div className="opinion__body">
          <div className="opinion__content">
            {/* $FlowFixMe Will be a fragment soon */}
            <UserAvatarDeprecated user={comment.author} />
            <div className="comment__detail">
              <div id={`comment_${comment.id}`}>
                <div className="opinion__data">
                  {/* $FlowFixMe $refType */}
                  <CommentInfos comment={comment} />
                </div>
                {/* $FlowFixMe $refType */}
                <CommentBody comment={comment} />
              </div>
              <div className="comment__action">
                {/* $FlowFixMe $refType */}
                <CommentDate comment={comment} />
                <div className="comment__buttons">
                  {/* $FlowFixMe $refType */}
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
      ...CommentVoteButton_comment
      ...CommentDate_comment
      ...CommentInfos_comment
      ...CommentBody_comment
    }
  `,
});
