// @flow
import React from 'react';
import { graphql, useFragment } from 'react-relay';
import { Box } from '@cap-collectif/ui';
import Comment from '~/components/Comment/Comment';
import { type CommentListNotApprovedByModerator_commentable$key } from '~relay/CommentListNotApprovedByModerator_commentable.graphql';

type Props = {|
  +commentable: CommentListNotApprovedByModerator_commentable$key,
  +useBodyColor: boolean,
|};

const COMMENT_FRAGMENT = graphql`
  fragment CommentListNotApprovedByModerator_commentable on Commentable {
    viewerNotApprovedByModeratorComments(first: 100)
      @connection(key: "CommentListNotApprovedByModerator_viewerNotApprovedByModeratorComments") {
      totalCount
      edges {
        node {
          ...Comment_comment @arguments(isAuthenticated: true)
        }
      }
    }
  }
`;

const CommentListNotApprovedByModerator = ({ commentable: commentRef, useBodyColor }: Props) => {
  const commentable = useFragment(COMMENT_FRAGMENT, commentRef);
  const nodes =
    commentable?.viewerNotApprovedByModeratorComments?.edges
      ?.filter(Boolean)
      ?.map(edge => edge.node) ?? [];

  if (nodes.length === 0) return null;

  return (
    <Box mb={4}>
      {nodes.map(node => (
        <Comment comment={node} useBodyColor={useBodyColor} disabledButton />
      ))}
    </Box>
  );
};

export default CommentListNotApprovedByModerator;
