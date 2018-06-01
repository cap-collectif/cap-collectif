// @flow
import React from 'react';
import CommentList from './CommentList';

type Props = {
  comments: Array<$FlowFixMe>,
  onVote: Function,
};

class CommentAnswers extends React.Component<Props> {
  render() {
    const { comments, onVote } = this.props;
    if (comments) {
      return (
        <div>
          <CommentList comments={comments} onVote={onVote} root={false} />
        </div>
      );
    }
    return null;
  }
}

export default CommentAnswers;
