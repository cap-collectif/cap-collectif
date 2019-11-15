// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import UserAvatar from '../User/UserAvatar';
import CommentInfos from './CommentInfos';
import CommentBody from './CommentBody';
import CommentVoteButton from './CommentVoteButton';
import CommentReportButton from './CommentReportButton';
import CommentEdit from './CommentEdit';
import Media from '../Ui/Medias/Media/Media';
import { CommentContainer } from './styles';
import type { CommentAnswer_comment } from '~relay/CommentAnswer_comment.graphql';

type Props = {|
  +comment: CommentAnswer_comment,
  +isHighlighted?: ?boolean,
  +useBodyColor: boolean,
|};

export class CommentAnswer extends React.Component<Props> {
  render() {
    const { comment, useBodyColor, isHighlighted } = this.props;

    return (
      // $FlowFixMe
      <CommentContainer
        as="li"
        useBodyColor={useBodyColor || (comment.author && comment.author.vip)}
        isHighlighted={isHighlighted}
        isAnswer>
        <div className="Commentavatar">
          <UserAvatar user={comment.author} />
        </div>
        <Media className="opinion">
          <Media.Body className="opinion__body">
            <div className="opinion__data">
              <CommentInfos comment={comment} />
            </div>
            <CommentBody comment={comment} />
            <div className="small">
              <CommentVoteButton comment={comment} />
              <CommentReportButton comment={comment} />
              <CommentEdit comment={comment} />
            </div>
          </Media.Body>
        </Media>
      </CommentContainer>
    );
  }
}

export default createFragmentContainer(CommentAnswer, {
  comment: graphql`
    fragment CommentAnswer_comment on Comment
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      author {
        vip
        displayName
        ...UserAvatar_user
      }
      ...CommentDate_comment
      ...CommentInfos_comment
      ...CommentEdit_comment @arguments(isAuthenticated: $isAuthenticated)
      ...CommentBody_comment
      ...CommentVoteButton_comment @arguments(isAuthenticated: $isAuthenticated)
      ...CommentReportButton_comment @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
});
