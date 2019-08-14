// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import UserAvatarDeprecated from '../User/UserAvatarDeprecated';
import CommentInfos from './CommentInfos';
import CommentBody from './CommentBody';
import CommentVoteButton from './CommentVoteButton';
import CommentReportButton from './CommentReportButton';
import CommentEdit from './CommentEdit';
import Media from '../Ui/Medias/Media/Media';
import { CommentContainer } from './styles';
import type { CommentAnswer_comment } from '~relay/CommentAnswer_comment.graphql';

type Props = {
  comment: CommentAnswer_comment,
  isHighlighted?: ?boolean,
  useBodyColor?: ?boolean,
};

export class CommentAnswer extends React.Component<Props> {
  render() {
    const { comment, useBodyColor, isHighlighted } = this.props;

    return (
      <CommentContainer
        as="li"
        useBodyColor={useBodyColor || (comment.author && comment.author.vip)}
        isHighlighted={isHighlighted}
        isAnswer>
        <div className="Commentavatar">
          {/* $FlowFixMe Will be a fragment soon */}
          <UserAvatarDeprecated user={comment.author} />
        </div>
        <Media className="opinion">
          <Media.Body className="opinion__body">
            <div className="opinion__data">
              {/* $FlowFixMe $refType */}
              <CommentInfos comment={comment} />
            </div>
            {/* $FlowFixMe $refType */}
            <CommentBody comment={comment} />
            <div className="small">
              {/* $FlowFixMe $refType */}
              <CommentVoteButton comment={comment} /> {/* $FlowFixMe $refType */}
              <CommentReportButton comment={comment} /> {/* $FlowFixMe $refType */}
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
        media {
          url
        }
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
