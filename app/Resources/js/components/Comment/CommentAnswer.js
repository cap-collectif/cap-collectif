// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import classNames from 'classnames';
import UserAvatar from '../User/UserAvatar';
import CommentInfos from './CommentInfos';
import CommentDate from './CommentDate';
import CommentBody from './CommentBody';
import CommentVoteButton from './CommentVoteButton';
import CommentReportButton from './CommentReportButton';
import CommentEdit from './CommentEdit';
import type { CommentAnswer_comment } from '~relay/CommentAnswer_comment.graphql';

type Props = {
  comment: CommentAnswer_comment,
  isHighlighted?: ?boolean,
};

export class CommentAnswer extends React.Component<Props> {
  render() {
    const { comment, isHighlighted } = this.props;
    const classes = classNames({
      opinion: true,
      'opinion--comment': true,
    });
    const detailClasses = classNames({
      'bg-vip': comment.author && comment.author.vip,
      comment__description: true,
      'highlighted-comment': isHighlighted,
    });

    return (
      <li className={classes}>
        <div className="opinion__body">
          <div className="opinion__content">
            {/* $FlowFixMe Will be a fragment soon */}
            <UserAvatar user={comment.author} />
            <div className="comment__detail">
              <div className={detailClasses} id={`comment_${comment.id}`}>
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
                  <CommentVoteButton comment={comment} /> {/* $FlowFixMe $refType */}
                  <CommentReportButton comment={comment} /> {/* $FlowFixMe $refType */}
                  <CommentEdit comment={comment} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
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
