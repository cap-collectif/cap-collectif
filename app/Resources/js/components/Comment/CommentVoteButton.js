

var CommentVoteButton = React.createClass({
    mixins: [ReactIntl.IntlMixin],

    render() {
        return (
            <span>
                { this.renderFormOrDisabled() }
                &nbsp;
                <span className="opinion__votes-nb">{ this.props.comment.vote_count }</span>
            </span>
        );
    },

    renderFormOrDisabled() {
        if (!this.props.comment.can_contribute) {
            return (
                <button disabled="disabled" className="btn  btn-dark-gray  btn-xs">
                    <i className="cap-hand-like-2"></i>
                    { this.getIntlMessage('comment.vote.submit') }
                </button>
            );
        }

        return (
            <form method="POST" style={{display: 'inline-block'}} action={this.props.comment._links.vote}>
                { this.renderVoteButton() }
            </form>
        )
    },

    renderVoteButton() {
        if (this.props.comment.has_user_voted) {
            return (
                <button className="btn  btn-danger  btn-xs">
                    { this.getIntlMessage('comment.vote.delete') }
                </button>
            );
        }

        return (
            <button className="btn  btn-success  btn--outline  btn-xs">
                <i className="cap-hand-like-2"></i>
                { this.getIntlMessage('comment.vote.submit') }
            </button>
        );
    }

});


export default CommentVoteButton;
