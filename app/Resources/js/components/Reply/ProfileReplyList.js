// // @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import type { ProfileReplyList_replies } from '~relay/ProfileReplyList_replies.graphql';

type RelayProps = {|
  replies: ProfileReplyList_replies,
|};

type Props = {|
  ...RelayProps,
|};

class ProfileReplyList extends React.Component<Props> {
  render() {
    const { replies } = this.props;

    return (
      <div>
        {replies.edges &&
          replies.edges
            .filter(Boolean)
            .map(edge => edge.node)
            .filter(Boolean)
            .map((reply, index) => <div key={index}> Hello {reply.id} </div>)}
      </div>
    );
  }
}

export default createFragmentContainer(ProfileReplyList, {
  replies: graphql`
    fragment ProfileReplyList_replies on ReplyConnection
      @argumentDefinitions(isAuthenticated: { type: "Boolean!", defaultValue: false }) {
      edges {
        node {
          id
          private
          responses {
            id
            ... on ValueResponse {
              value
            }
            ... on MediaResponse {
              medias {
                url
              }
            }
          }
        }
      }
    }
  `,
});
