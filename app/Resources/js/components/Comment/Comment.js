import UserAvatar from '../User/UserAvatar';
import CommentAuthor from './CommentAuthor';
import CommentBody from './CommentBody';
import CommentVoteButton from './CommentVoteButton';
import CommentReport from './CommentReport';
import CommentEdit from './CommentEdit';
import CommentAnswers from './CommentAnswers';
import CommentAnswerForm from './CommentAnswerForm';
import LoginStore from '../../stores/LoginStore';

var FormattedDate = ReactIntl.FormattedDate;

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
                <UserAvatar user={comment.user} />
                <div className="opinion__data">
                    <CommentAuthor comment={comment} />
                    <p className="excerpt  opinion__date">
                        <FormattedDate value={comment.created_at} day="numeric" month="long" year="numeric" hour="numeric" minute="numeric" />
                    </p>
                </div>
                <CommentBody comment={comment} />
                <CommentVoteButton comment={comment} />&nbsp;
                { this.renderReporting(comment) }&nbsp;
                <CommentEdit comment={comment} />
                {(this.props.root === true && LoginStore.isLoggedIn()
                    ? <a onClick={ this.answer.bind(this) } className="btn btn-xs btn-dark-gray btn--outline">
                        { this.getIntlMessage('global.answer') }
                      </a>
                    : <span />
                )}
                {(this.props.root === true
                    ? <CommentAnswers comments={comment.answers} />
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

    renderReporting(comment) {
        if (this.props.can_report) {
            return (
                <CommentReport comment={comment} />
            );
        }
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
