import UserAvatar from '../User/UserAvatar';
import CommentAuthor from './CommentAuthor';
import CommentBody from './CommentBody';
import CommentVoteButton from './CommentVoteButton';
import CommentReport from './CommentReport';
import CommentEdit from './CommentEdit';

var FormattedDate = ReactIntl.FormattedDate;

var Comment = React.createClass({
    mixins: [ReactIntl.IntlMixin],

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
    }
});

export default Comment;
