import Comment from './Comment';

const CommentList = React.createClass({
  propTypes: {
    root: React.PropTypes.bool,
    comments: React.PropTypes.array.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    if (this.props.comments.length === 0) {
      return <ul></ul>;
    }

    const classes = classNames({
      'media-list': true,
      'opinion__list': true,
      'comment-answers': !this.props.root,
    });

    return (
      <ul className={classes}>
        {
          this.props.comments.map((comment) => {
            if (comment.can_contribute) {
              return (
                <Comment
                  {...this.props}
                  key={comment.id}
                  comment={comment}
                  root={this.props.root}
                />
              );
            }
            return null;
          })
        }
      </ul>
    );
  },

});

export default CommentList;
