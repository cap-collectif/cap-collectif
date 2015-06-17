
var CommentVoteButton = React.createClass({
    mixins: [ReactIntl.IntlMixin],
    render() {
        if (!this.props.comment.can_contribute) {
            return (
                <button disabled="disabled" className="btn  btn-dark-gray  btn-xs">
                    <i className="cap-hand-like-2"></i>
                    { this.getIntlMessage('comment.vote.submit') }
                </button>
            );
        }

        return (
            <form method="POST" style={{display: 'inline-block'}} action="{{ path('app_comment_vote', {'commentId': comment.id } ) }}">
                { this.renderVoteButton() }
                <input type="hidden" name="_csrf_token" value="{{ token }}" />
            </form>
        )
    },

    renderVoteButton() {
        if (this.propos.comment.has_user_voted) {
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
