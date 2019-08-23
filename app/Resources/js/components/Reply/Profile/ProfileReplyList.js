// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import type { ProfileReplyList_replies } from '~relay/ProfileReplyList_replies.graphql';
import Reply from './Reply';

type RelayProps = {|
  replies: ProfileReplyList_replies,
|};

type Props = {|
  ...RelayProps,
  isProfileEnabled: boolean,
|};

export class ProfileReplyList extends React.Component<Props> {
  static defaultProps = {
    isProfileEnabled: false,
  };

  render() {
    const { replies, isProfileEnabled } = this.props;

    return (
      <div>
        {replies.edges &&
          replies.edges
            .filter(Boolean)
            .map(edge => edge.node)
            .filter(Boolean)
            .map((reply, index) => (
              <Reply key={index} reply={reply} isProfileEnabled={isProfileEnabled} />
            ))}
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
          ...Reply_reply @arguments(isAuthenticated: $isAuthenticated)
        }
      }
    }
  `,
});
