import React, { PropTypes } from 'react';
import classNames from 'classnames';
import Comment from './Comment';

const CommentList = React.createClass({
  propTypes: {
    root: PropTypes.bool,
    comments: PropTypes.array.isRequired,
    onVote: PropTypes.func.isRequired
  },

  render() {
    const { comments, onVote, root } = this.props;
    if (comments.length === 0) {
      return <ul />;
    }

    const classes = classNames({
      'media-list': true,
      opinion__list: true,
      'comment-answers': !root
    });

    return (
      <ul id="comments" className={classes}>
        {comments.map(comment => {
          return (
            <Comment
              {...this.props}
              key={comment.id}
              comment={comment}
              root={root}
              onVote={onVote}
            />
          );
        })}
      </ul>
    );
  }
});

export default CommentList;
