// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import ProfileComment from './ProfileComment';
import type { ProfileCommentList_comments } from '~relay/ProfileCommentList_comments.graphql';

type RelayProps = {|
  comments: ProfileCommentList_comments,
|};

type Props = {|
  ...RelayProps,
|};

class ProfileCommentList extends React.Component<Props> {
  render() {
    const { comments } = this.props;

    return (
      <ul className="media-list">
        {comments.edges &&
          comments.edges
            .filter(Boolean)
            .map(edge => edge.node)
            .filter(Boolean)
            .map(comment => (
              // $FlowFixMe https://github.com/cap-collectif/platform/issues/4973
              <ProfileComment key={comment.id} comment={comment} />
            ))}
      </ul>
    );
  }
}

export default createFragmentContainer(ProfileCommentList, {
  comments: graphql`
    fragment ProfileCommentList_comments on CommentConnection
      @argumentDefinitions(isAuthenticated: { type: "Boolean!", defaultValue: false }) {
      edges {
        node {
          id
          ...ProfileComment_comment
        }
      }
    }
  `,
});
