// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { GraphQLTaggedNode } from 'relay-runtime/query/GraphQLTag';
import type { UserInviteList_query } from '~relay/UserInviteList_query.graphql';

export type RelayProps = {|
  +query: UserInviteList_query,
|};

export type Arguments = {|
  +first: number,
  +cursor?: string,
  +term?: string,
  +status: { type: 'UserInviteStatus' },
|};

export const FRAGMENT: GraphQLTaggedNode = graphql`
  fragment UserInviteList_query on Query
    @argumentDefinitions(
      first: { type: "Int", defaultValue: 50 }
      cursor: { type: "String" }
      term: { type: "String", defaultValue: null }
      status: { type: "UserInviteStatus" }
    )
    @refetchable(queryName: "UserInviteListQuery") {
    userInvitations(first: $first, after: $cursor, term: $term, status: $status)
      @connection(key: "UserInviteList_userInvitations") {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          id
          email
          isAdmin
          isProjectAdmin
          status
          groups {
            edges {
              node {
                title
              }
            }
          }
        }
      }
    }
  }
`;

export const CONNECTION_NODES_PER_PAGE: number = 50;
