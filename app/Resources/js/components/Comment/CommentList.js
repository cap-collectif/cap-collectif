// @flow
import React from 'react';
import classNames from 'classnames';
import Comment from './Comment';

type Props = {
  root?: boolean,
  comments: Array<$FlowFixMe>,
  onVote: Function,
};

class CommentList extends React.Component<Props> {
  render() {
    const { comments, onVote, root } = this.props;
    if (comments.length === 0) {
      return <ul />;
    }

    const classes = classNames({
      'media-list': true,
      opinion__list: true,
      'comment-answers': !root,
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
}

export default CommentList;
