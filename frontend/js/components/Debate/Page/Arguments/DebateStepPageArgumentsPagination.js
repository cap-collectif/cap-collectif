// @flow
import * as React from 'react';
import { graphql } from 'react-relay';
import { useFragment, usePagination } from 'relay-hooks';
import type {
  DebateStepPageArgumentsPagination_debate,
  DebateStepPageArgumentsPagination_debate$key,
} from '~relay/DebateStepPageArgumentsPagination_debate.graphql';
import type { DebateStepPageArgumentsPagination_viewer$key } from '~relay/DebateStepPageArgumentsPagination_viewer.graphql';
import AppBox from '~/components/Ui/Primitives/AppBox';
import ArgumentCard from '~/components/Debate/ArgumentCard/ArgumentCard';
import type { RelayHookPaginationProps, ConnectionMetadata } from '~/types';
import ModalModerateArgument from '~/components/Debate/Page/Arguments/ModalModerateArgument';
import ModalReportArgument from '~/components/Debate/Page/Arguments/ModalReportArgument';
import ModalDeleteArgument from '~/components/Debate/Page/Arguments/ModalDeleteArgument';

type Props = {|
  +debate: DebateStepPageArgumentsPagination_debate$key & { +id: string },
  +viewer: ?DebateStepPageArgumentsPagination_viewer$key,
  +handleChange: ({ ...RelayHookPaginationProps, hasMore: boolean }) => void,
|};

export const CONNECTION_NODES_PER_PAGE = 8;

export const FRAGMENT = graphql`
  fragment DebateStepPageArgumentsPagination_debate on Debate
    @argumentDefinitions(
      first: { type: "Int", defaultValue: 1 }
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

const VIEWER_FRAGMENT = graphql`
  fragment DebateStepPageArgumentsPagination_viewer on User {
    ...ArgumentCard_viewer
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

export const DebateStepPageArgumentsPagination = ({
  debate,
  viewer: viewerFragment,
  handleChange,
}: Props) => {
  const [argumentsQuery, paginationProps]: [
    DebateStepPageArgumentsPagination_debate,
    RelayHookPaginationProps,
  ] = usePagination(FRAGMENT, debate);
  const viewer = useFragment(VIEWER_FRAGMENT, viewerFragment);
  const [reportModalId, setReportModalId] = React.useState<?string>(null);
  const [moderateModalId, setModerateModalId] = React.useState<?string>(null);
  const [deleteModalInfo, setDeleteModalInfo] = React.useState<?{
    id: string,
    type: 'FOR' | 'AGAINST',
  }>(null);

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
          <ArgumentCard
            argument={argument}
            viewer={viewer}
            setReportModalId={setReportModalId}
            setModerateModalId={setModerateModalId}
            setDeleteModalInfo={setDeleteModalInfo}
          />
        </AppBox>
      ))}

      {moderateModalId && (
        <ModalModerateArgument
          argumentId={moderateModalId}
          onClose={() => setModerateModalId(null)}
        />
      )}

      {reportModalId && (
        <ModalReportArgument argumentId={reportModalId} onClose={() => setReportModalId(null)} />
      )}

      {deleteModalInfo && (
        <ModalDeleteArgument
          debateId={debate.id}
          argumentInfo={deleteModalInfo}
          onClose={() => setDeleteModalInfo(null)}
        />
      )}
    </>
  );
};

export default DebateStepPageArgumentsPagination;
