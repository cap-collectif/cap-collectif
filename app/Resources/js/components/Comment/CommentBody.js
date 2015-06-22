var CommentBody = React.createClass({
    mixins: [ReactIntl.IntlMixin],

    render() {
        var classes = 'opinion__text';
        if (this.props.comment.body.length > 500) {
            classes += ' more';
        }
        return (
            <p className={classes} dangerouslySetInnerHTML={{__html: this.props.comment.body }}>
                { this.renderTrashedLabel() }
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
