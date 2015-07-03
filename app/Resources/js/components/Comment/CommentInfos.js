var CommentInfos = React.createClass({
    mixins: [ReactIntl.IntlMixin],

    render() {
        return (
            <p className="h5  opinion__user">
                { this.renderAuthorName() }
                &nbsp;&nbsp;
                { this.renderDate() }
            </p>
        );
    },

    renderDate() {
        return (
            <span className="excerpt">
                <ReactIntl.FormattedDate value={this.props.comment.created_at}
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
