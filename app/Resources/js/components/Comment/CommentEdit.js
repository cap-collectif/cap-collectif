// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import type { CommentEdit_comment } from './__generated__/CommentEdit_comment.graphql';

type Props = {
  comment: CommentEdit_comment,
};

export class CommentEdit extends React.Component<Props> {
  render() {
    const { comment } = this.props;
    if (comment.contribuable && comment.author && comment.author.isViewer) {
      return (
        <a href={comment.editUrl} className="btn btn-dark-gray btn--outline btn-sm">
          <i className="cap cap-pencil-1" />
          <FormattedMessage id="comment.update.button" />
        </a>
      );
    }
    return null;
  }
}

export default createFragmentContainer(CommentEdit, {
  comment: graphql`
    fragment CommentEdit_comment on Comment
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      contribuable
      author {
        isViewer @include(if: $isAuthenticated)
      }
      editUrl
    }
  `,
});
