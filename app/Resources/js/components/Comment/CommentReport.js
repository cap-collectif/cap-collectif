
var CommentReport = React.createClass({
    mixins: [ReactIntl.IntlMixin],
    render() {
        if (!this.props.comment.has_user_reported) {
            return (
                <button disabled="disabled" className="btn btn-xs btn-dark-gray">
                    <i className="cap cap-flag-1"></i>
                    { this.getIntlMessage('comment.report.reported') }
                </button>
            );
        }

        return (
            <a href="{{ path('app_report_comment' ,{'commentId': comment.id } ) }}" className="btn btn-xs btn-dark-gray  btn--outline">
                <i className="cap cap-flag-1"></i>
                { this.getIntlMessage('comment.report.submit') }
            </a>
        )
    }
});

export default CommentReport;
