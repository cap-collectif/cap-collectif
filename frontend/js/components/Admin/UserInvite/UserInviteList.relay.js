// @flow
import { graphql } from 'relay-hooks';
import type { UserInviteList_query } from '~relay/UserInviteList_query.graphql';
import type { ConnectionMetadata } from '~/types';

export type RelayProps = {|
  +query: UserInviteList_query,
|};

export type Arguments = {|
  +first: number,
  +cursor?: string,
|};

export const FRAGMENT = graphql`
  fragment UserInviteList_query on Query
    @argumentDefinitions(first: { type: "Int", defaultValue: 50 }, cursor: { type: "String" }) {
    userInvitations(first: $first, after: $cursor)
      @connection(key: "UserInviteList_userInvitations") {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          id
          ...UserInviteListRow_invitation
        }
      }
    }
  }
`;

export const CONNECTION_NODES_PER_PAGE = 50;

export const CONNECTION_CONFIG = {
  getVariables(props: RelayProps, { count, cursor }: ConnectionMetadata) {
    return {
      first: count,
      cursor,
    };
  },
  query: graphql`
    query UserInviteListPaginationQuery($first: Int!, $cursor: String) {
      ...UserInviteList_query @arguments(first: $first, cursor: $cursor)
    }
  `,
};
