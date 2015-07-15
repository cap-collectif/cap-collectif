var FormattedDate = ReactIntl.FormattedDate;

var CommentInfos = React.createClass({
    mixins: [ReactIntl.IntlMixin],

    render() {
        return (
            <p className="h5  opinion__user">
                { this.renderAuthorName() }
                { '  ' }
                { this.renderDate() }
                { this.renderEditionDate() }
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


    renderEditionDate() {
        if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
            return;
        }
        if (this.props.comment.updated_at === this.props.comment.created_at) {
            return;
        }
        return (
            <span className="excerpt">
                { ' - ' }
                { this.getIntlMessage('comment.edited') }
                { ' ' }
                <FormattedDate
                    value={this.props.comment.updated_at}
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
