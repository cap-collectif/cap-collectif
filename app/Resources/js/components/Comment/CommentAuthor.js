var CommentAuthor = React.createClass({

    render() {
        return (
            <p className="h5  opinion__user">
                { this.renderAuthorName() }
            </p>
        );
    },

    renderAuthorName() {
        if (this.props.comment.author) {
            return <a href="#">{ this.props.comment.author.username }</a>;
        }
        return <a href="#">{ this.props.comment.authorName }</a>;
    }

});

export default CommentAuthor;
