var CommentBody = React.createClass({
    mixins: [ReactIntl.IntlMixin],
    render() {
        return (
            <p className="opinion__text">
                { this.renderTrashedLabel() }
                { this.props.comment.body }
            </p>
        )
    },

    renderTrashedLabel() {
        if (this.props.comment.isTrashed) {
            return(
                <span className="label label-default" style="position: static">
                    { this.getIntlMessage('comment.trashed.label') }
                </span>
            );
        }

        return;
    }
});

export default CommentBody;
