// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import UserAvatar from '../User/UserAvatar';
import CommentInfos from './CommentInfos';
import CommentDate from './CommentDate';
import CommentBody from './CommentBody';
import CommentVoteButton from './CommentVoteButton';
import CommentReportButton from './CommentReportButton';
import CommentEdit from './CommentEdit';
import CommentAnswers from './CommentAnswers';
import CommentForm from './CommentForm';
import type { Comment_comment } from './__generated__/Comment_comment.graphql';

type Props = {
  comment: Comment_comment,
  isHighlighted?: ?boolean,
};

type State = {
  answerFormShown: boolean,
  answerFormFocus: boolean,
};

export class Comment extends React.Component<Props, State> {
  state = { answerFormShown: false, answerFormFocus: false };

  focusAnswer = () => {
    this.setState({
      answerFormShown: true,
      answerFormFocus: true,
    });
  };

  render() {
    const { comment, isHighlighted } = this.props;
    const classes = classNames({
      opinion: true,
      'opinion--comment': true,
    });
    const detailClasses = classNames({
      'bg-vip': comment.author && comment.author.vip,
      comment__descripton: true,
      'highlighted-comment': isHighlighted,
    });

    return (
      <li className={classes}>
        <div className="opinion__body">
          <div className="opinion__content">
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
                  <CommentVoteButton comment={comment} />{' '}
                  <Button
                    bsStyle="link"
                    bsSize="sm"
                    onClick={this.focusAnswer}
                    className="btn-dark-gray btn--outline">
                    <i className="cap-reply-mail-2" /> <FormattedMessage id="global.answer" />
                  </Button>{' '}
                  {/* $FlowFixMe $refType */}
                  <CommentReportButton comment={comment} /> {/* $FlowFixMe $refType */}
                  <CommentEdit comment={comment} />{' '}
                </div>
              </div>
            </div>
          </div>
          <div className="comment-answers-block">
            {/* $FlowFixMe $refType */}
            <CommentAnswers comment={comment} />
            {this.state.answerFormShown ? (
              <CommentForm commentable={comment} answerOf={comment.id} />
            ) : null}
          </div>
        </div>
      </li>
    );
  }
}

export default createFragmentContainer(Comment, {
  comment: graphql`
    fragment Comment_comment on Comment
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      author {
        vip
        displayName
        media {
          url
        }
      }
      ...CommentAnswers_comment @arguments(isAuthenticated: $isAuthenticated)
      ...CommentDate_comment
      ...CommentInfos_comment
      ...CommentBody_comment
      ...CommentEdit_comment @arguments(isAuthenticated: $isAuthenticated)
      ...CommentVoteButton_comment @arguments(isAuthenticated: $isAuthenticated)
      ...CommentReportButton_comment @arguments(isAuthenticated: $isAuthenticated)
      ...CommentForm_commentable
    }
  `,
});
