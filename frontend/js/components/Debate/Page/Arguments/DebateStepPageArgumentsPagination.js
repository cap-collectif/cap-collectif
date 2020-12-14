// @flow
import * as React from 'react';
import { graphql } from 'react-relay';
import { usePagination } from 'relay-hooks';
import type {
  DebateStepPageArgumentsPagination_debate,
  DebateStepPageArgumentsPagination_debate$key,
} from '~relay/DebateStepPageArgumentsPagination_debate.graphql';
import AppBox from '~/components/Ui/Primitives/AppBox';
import ArgumentCard from '~/components/Debate/ArgumentCard/ArgumentCard';
import type { RelayHookPaginationProps, ConnectionMetadata } from '~/types';

type Props = {|
  +debate: DebateStepPageArgumentsPagination_debate$key,
  +handleChange: ({ ...RelayHookPaginationProps, hasMore: boolean }) => void,
|};

export const CONNECTION_NODES_PER_PAGE = 3; // Pour la recette plus tard, ça bougera

export const FRAGMENT = graphql`
  fragment DebateStepPageArgumentsPagination_debate on Debate
    @argumentDefinitions(
      first: { type: "Int", defaultValue: 3 }
      cursor: { type: "String" }
      value: { type: "ForOrAgainstValue!" }
      orderBy: { type: "DebateArgumentOrder" }
      isAuthenticated: { type: "Boolean!" }
    ) {
    id
    arguments(value: $value, first: $first, after: $cursor, orderBy: $orderBy)
      @connection(key: "DebateStepPageArgumentsPagination_arguments", filters: ["value"]) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          ...ArgumentCard_argument @arguments(isAuthenticated: $isAuthenticated)
        }
      }
    }
  }
`;

const getVariables = (
  props: {| id: string |},
  { count, cursor }: ConnectionMetadata,
  fragmentVariables: { orderBy: { field: string, direction: string }, isAuthenticated: boolean },
) => {
  return {
    first: count,
    cursor,
    debateId: props?.id,
    orderBy: fragmentVariables.orderBy,
    isAuthenticated: fragmentVariables.isAuthenticated,
  };
};

export const CONNECTION_CONFIG_YES = {
  getVariables,
  query: graphql`
    query DebateStepPageArgumentsPaginationRefetchYesQuery(
      $debateId: ID!
      $first: Int!
      $cursor: String
      $orderBy: DebateArgumentOrder
      $isAuthenticated: Boolean!
    ) {
      yesDebate: node(id: $debateId) {
        ...DebateStepPageArgumentsPagination_debate
          @arguments(
            isAuthenticated: $isAuthenticated
            first: $first
            cursor: $cursor
            orderBy: $orderBy
            value: FOR
          )
      }
    }
  `,
};

export const CONNECTION_CONFIG_NO = {
  getVariables,
  query: graphql`
    query DebateStepPageArgumentsPaginationRefetchNoQuery(
      $debateId: ID!
      $first: Int!
      $cursor: String
      $orderBy: DebateArgumentOrder
      $isAuthenticated: Boolean!
    ) {
      noDebate: node(id: $debateId) {
        ...DebateStepPageArgumentsPagination_debate
          @arguments(
            isAuthenticated: $isAuthenticated
            first: $first
            cursor: $cursor
            orderBy: $orderBy
            value: AGAINST
          )
      }
    }
  `,
};

export const DebateStepPageArgumentsPagination = ({ debate, handleChange }: Props) => {
  const [argumentsQuery, paginationProps]: [
    DebateStepPageArgumentsPagination_debate,
    RelayHookPaginationProps,
  ] = usePagination(FRAGMENT, debate);

  if (handleChange) handleChange({ ...paginationProps, hasMore: paginationProps.hasMore() });

  if (!debate || !argumentsQuery) return null;
  const debateArguments = argumentsQuery?.arguments.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean);

  return (
    <>
      {debateArguments?.map(argument => (
        <AppBox key={argument.id} marginBottom={6}>
          <ArgumentCard argument={argument} />
        </AppBox>
      ))}
    </>
  );
};

export default DebateStepPageArgumentsPagination;
