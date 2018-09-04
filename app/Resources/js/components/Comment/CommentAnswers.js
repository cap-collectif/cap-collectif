// @flow
import React from 'react';
import classNames from 'classnames';
import { graphql, createFragmentContainer } from 'react-relay';
import CommentAnswer from './CommentAnswer';
import type { CommentAnswers_comment } from './__generated__/CommentAnswers_comment.graphql';

type Props = {
  comment: CommentAnswers_comment,
};

const classes = classNames({
  'media-list': true,
  opinion__list: true,
  'comment-answers': true,
});

class CommentAnswers extends React.Component<Props> {
  render() {
    const { comment } = this.props;
    if (!comment.answers || comment.answers.totalCount === 0) {
      return null;
    }

    return (
      <ul id="comments" className={classes}>
        {comment.answers &&
          comment.answers.edges &&
          comment.answers.edges
            .filter(Boolean)
            .map(edge => edge.node)
            .filter(Boolean)
            .map(node => {
              // $FlowFixMe
              return <CommentAnswer key={node.id} comment={node} />;
            })}
      </ul>
    );
  }
}

export default createFragmentContainer(CommentAnswers, {
  comment: graphql`
    fragment CommentAnswers_comment on Comment
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 100 }
        cursor: { type: "String", defaultValue: null }
        orderBy: { type: "CommentOrder!", defaultValue: { field: PUBLISHED_AT, direction: ASC } }
        isAuthenticated: { type: "Boolean!" }
      ) {
      id
      answers: comments(first: $count, after: $cursor, orderBy: $orderBy)
        @connection(key: "CommentAnswers_answers", filters: []) {
        totalCount
        edges {
          node {
            id
            ...CommentAnswer_comment @arguments(isAuthenticated: $isAuthenticated)
          }
        }
      }
    }
  `,
});
