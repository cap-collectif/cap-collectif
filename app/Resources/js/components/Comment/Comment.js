import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import UserAvatar from '../User/UserAvatar';
import CommentInfos from './CommentInfos';
import CommentBody from './CommentBody';
import CommentVoteButton from './CommentVoteButton';
import CommentReportButton from './CommentReportButton';
import CommentEdit from './CommentEdit';
import CommentAnswers from './CommentAnswers';
import CommentForm from './CommentForm';
import CommentActions from '../../actions/CommentActions';

const Comment = React.createClass({
  propTypes: {
    uri: PropTypes.string,
    object: PropTypes.number,
    comment: PropTypes.object,
    root: PropTypes.bool,
    onVote: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    const { comment } = this.props;
    if (comment.answers.length > 0) {
      return {
        answerFormShown: true,
        answerFormFocus: false,
      };
    }
    return {
      answerFormShown: false,
      answerFormFocus: false,
    };
  },

  answer() {
    this.setState({
      answerFormShown: true,
      answerFormFocus: true,
    });
  },

  comment(data) {
    const {
      comment,
      object,
      uri,
    } = this.props;
    data.parent = comment.id;
    return CommentActions.create(uri, object, data);
  },

  render() {
    const {
      onVote,
      root,
    } = this.props;
    const comment = this.props.comment;
    const classes = classNames({
      opinion: true,
      'opinion--comment': true,
    });
    const contentClasses = classNames({
      'bg-vip': comment.author && comment.author.vip,
      opinion__content: true,
    });
    return (
      <li className={classes} >
        <div className="opinion__body">
          <div className={contentClasses}>
            <UserAvatar user={comment.author} className="pull-left" />
            <div className="opinion__data">
              <CommentInfos comment={comment} />
            </div>
            <CommentBody comment={comment} />
            <div className="comment__buttons">
              <CommentVoteButton comment={comment} onVote={onVote} />
              {' '}
              {root
                ? <a onClick={this.answer} className="btn btn-xs btn-dark-gray btn--outline">
                    <i className="cap-reply-mail-2"></i>
                    { ' ' }
                    { this.getIntlMessage('global.answer') }
                  </a>
                : null
              }
              {' '}
              <CommentReportButton comment={comment} />
              {' '}
              <CommentEdit comment={comment} />
              {' '}
            </div>
          </div>
          <div className="comment-answers-block">
            {root
              ? <CommentAnswers onVote={onVote} comments={comment.answers} />
              : null
            }
            {this.state.answerFormShown
              ? <CommentForm comment={this.comment} focus={this.state.answerFormFocus} isAnswer />
              : null
            }
          </div>
        </div>
      </li>
    );
  },

});

export default Comment;
