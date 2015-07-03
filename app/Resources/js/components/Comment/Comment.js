import UserAvatar from '../User/UserAvatar';
import CommentInfos from './CommentInfos';
import CommentBody from './CommentBody';
import CommentVoteButton from './CommentVoteButton';
import CommentReport from './CommentReport';
import CommentEdit from './CommentEdit';
import CommentAnswers from './CommentAnswers';
import CommentAnswerForm from './CommentAnswerForm';
import LoginStore from '../../stores/LoginStore';

var Comment = React.createClass({
    mixins: [ReactIntl.IntlMixin],

    getInitialState() {
        if (this.props.comment.answers.length > 0) {
            return {
                answerFormShown: true,
                answerFormFocus: false
            }
        }
        return {
            answerFormShown: false,
            answerFormFocus: false
        }
    },

    render() {
        var comment = this.props.comment;
        return (
          <li className="opinion  opinion--comment" >
            <div className="opinion__body">
                <UserAvatar user={comment.author} />
                <div className="opinion__data">
                    <CommentInfos comment={comment} />
                </div>
                <CommentBody comment={comment} />
                <CommentVoteButton comment={comment} />&nbsp;
                {(this.props.root === true
                    ? <a onClick={ this.answer.bind(this) } className="btn btn-xs btn-dark-gray btn--outline">
                        <i className="cap-reply-mail-2"></i>
                        { this.getIntlMessage('global.answer') }
                      </a>
                    : <span />
                )}
                &nbsp;
                {(this.props.isReportingEnabled === true
                    ? <CommentReport comment={comment} />
                    : <span />
                )}
                &nbsp;
                <CommentEdit comment={comment} />&nbsp;
                {(this.props.root === true
                    ? <CommentAnswers isReportingEnabled={this.props.isReportingEnabled} comments={comment.answers} />
                    : <span />
                )}
                {(this.state.answerFormShown === true && LoginStore.isLoggedIn()
                    ? <CommentAnswerForm {...this.props} focus={this.state.answerFormFocus}/>
                    : <span />
                )}
            </div>
          </li>
        );
    },

    answer() {
        this.setState({
            answerFormShown: true,
            answerFormFocus: true
        });
        this.forceUpdate();
    }

});

export default Comment;
