import UserAvatar from '../User/UserAvatar';
import CommentInfos from './CommentInfos';
import CommentBody from './CommentBody';
import CommentVoteButton from './CommentVoteButton';
import CommentReport from './CommentReport';
import CommentEdit from './CommentEdit';
import CommentAnswers from './CommentAnswers';
import CommentForm from './CommentForm';
import CommentActions from '../../actions/CommentActions';
import LoginStore from '../../stores/LoginStore';

const Comment = React.createClass({
  propTypes: {
    uri: React.PropTypes.string,
    object: React.PropTypes.number,
    comment: React.PropTypes.object,
    root: React.PropTypes.bool,
    isReportingEnabled: React.PropTypes.bool,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    if (this.props.comment.answers.length > 0) {
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

  render() {
    const comment = this.props.comment;
    const classes = classNames({
      'opinion': true,
      'opinion--comment': true,
      'bg-vip': comment.author && comment.author.vip,
    });
    return (
      <li className={classes} >
        <div className="opinion__body">
          <UserAvatar user={comment.author} className="pull-left" />
          <div className="opinion__data">
            <CommentInfos comment={comment} />
          </div>
          <CommentBody comment={comment} />
          <div className="comment__buttons">
            <CommentVoteButton comment={comment} userIsAuthor={this.isTheUserTheAuthor()} />
            {' '}
            {(this.props.root === true
              ? <a onClick={ this.answer.bind(this) } className="btn btn-xs btn-dark-gray btn--outline">
                  <i className="cap-reply-mail-2"></i>
                  { ' ' }
                  { this.getIntlMessage('global.answer') }
                </a>
              : <span />
            )}
            {' '}
            {(this.props.isReportingEnabled === true && !this.isTheUserTheAuthor()
              ? <CommentReport comment={comment} />
              : <span />
            )}
            {' '}
            <CommentEdit comment={comment} />
            {' '}
          </div>
          <div className="comment-answers-block">
            {(this.props.root === true
              ? <CommentAnswers isReportingEnabled={this.props.isReportingEnabled} comments={comment.answers} />
              : <span />
            )}
            {(this.state.answerFormShown === true
              ? <CommentForm comment={this.comment.bind(this)} focus={this.state.answerFormFocus} isAnswer={true}/>
              : <span />
            )}
          </div>
        </div>
      </li>
    );
  },

  comment(data) {
    data.parent = this.props.comment.id;
    return CommentActions.create(this.props.uri, this.props.object, data);
  },

  isTheUserTheAuthor() {
    if (this.props.comment.author === null || !LoginStore.isLoggedIn()) {
      return false;
    }
    return LoginStore.user.uniqueId === this.props.comment.author.uniqueId;
  },

  answer() {
    this.setState({
      answerFormShown: true,
      answerFormFocus: true,
    });
  },

});

export default Comment;
