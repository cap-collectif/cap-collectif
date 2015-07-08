var FormattedDate = ReactIntl.FormattedDate;

var CommentInfos = React.createClass({
    mixins: [ReactIntl.IntlMixin],

    render() {
        return (
            <p className="h5  opinion__user">
                { this.renderAuthorName() }
                { '  ' }
                { this.renderDate() }
            </p>
        );
    },

    renderDate() {
        if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
            return;
        }
        return (
            <span className="excerpt">
                <FormattedDate
                    value={this.props.comment.created_at}
                    day="numeric" month="long" year="numeric"
                    hour="numeric" minute="numeric"
                 />
            </span>
        );
    },

    renderAuthorName() {
        if (this.props.comment.author) {
            return (
                <a href={this.props.comment.author._links.profile}>
                    { this.props.comment.author.username }
                </a>
            );
        }
        return <span>{ this.props.comment.author_name }</span>;
    }

});

export default CommentInfos;
