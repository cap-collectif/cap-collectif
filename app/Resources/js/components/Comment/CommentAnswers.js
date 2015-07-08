import Comment from './Comment';
import CommentList from './CommentList';

var CommentAnswers = React.createClass({
    mixins: [ReactIntl.IntlMixin],

    render() {
        if (this.props.comments) {
            return (
                <div>
                    <CommentList comments={this.props.comments} isReportingEnabled={this.props.isReportingEnabled} root={false}/>
                </div>
            );
        }
        return;
    }
});

export default CommentAnswers;
