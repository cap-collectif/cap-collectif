// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
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

type Props = {
  uri?: string,
  object?: string | number,
  comment: Object,
  root?: boolean,
  onVote: Function,
};

type State = {
  answerFormShown: boolean,
  answerFormFocus: boolean,
};

class Comment extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { comment } = props;
    if (comment.answers.length > 0) {
      this.state = {
        answerFormShown: true,
        answerFormFocus: false,
      };

      return;
    }

    this.state = {
      answerFormShown: false,
      answerFormFocus: false,
    };
  }

  answer = () => {
    this.setState({
      answerFormShown: true,
      answerFormFocus: true,
    });
  };

  render() {
    const { onVote, root, uri, object } = this.props;
    const comment = this.props.comment;
    const classes = classNames({
      opinion: true,
      'opinion--comment': true,
    });
    const detailClasses = classNames({
      'bg-vip': comment.author && comment.author.vip,
      comment__descript: true,
    });

    return (
      <li className={classes}>
        <div className="opinion__body">
          <div className="opinion__content">
            <UserAvatar user={comment.author} />
            <div className="comment__detail">
              <div className={detailClasses}>
                <div className="opinion__data">
                  <CommentInfos comment={comment} />
                </div>
                <CommentBody comment={comment} />
              </div>
              <div className="comment__action">
                <CommentDate comment={comment} />
                <div className="comment__buttons">
                  <CommentVoteButton comment={comment} onVote={onVote} />{' '}
                  {root ? (
                    <a onClick={this.answer} className="btn btn-sm btn-dark-gray btn--outline">
                      <i className="cap-reply-mail-2" /> {<FormattedMessage id="global.answer" />}
                    </a>
                  ) : null}{' '}
                  <CommentReportButton comment={comment} /> <CommentEdit comment={comment} />{' '}
                </div>
              </div>
            </div>
          </div>
          <div className="comment-answers-block">
            {root ? <CommentAnswers onVote={onVote} comments={comment.answers} /> : null}
            {this.state.answerFormShown ? (
              <CommentForm object={object} uri={uri} answerOf={comment.id} />
            ) : null}
          </div>
        </div>
      </li>
    );
  }
}

export default Comment;
