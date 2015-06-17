
var CommentEdit = React.createClass({
    mixins: [ReactIntl.IntlMixin],
    render() {
        if (!this.props.comment.can_user_edit) {
            return (
                <a href="{{ path('app_comment_edit' ,{'commentId': comment.id } ) }}" className="btn  btn-dark-gray  btn--outline  btn-xs">
                    <i className="cap cap-pencil-1"></i>
                    { this.getIntlMessage('comment.update.button') }
                </a>
            );
        }

        return;
    }
});

export default CommentEdit;
