// @flow
import * as React from 'react';
import { graphql } from 'react-relay';
import { useFragment, usePagination } from 'relay-hooks';
import type {
  DebateStepPageArgumentsPagination_debate,
  DebateStepPageArgumentsPagination_debate$key,
} from '~relay/DebateStepPageArgumentsPagination_debate.graphql';
import type {
  ArgumentCard_argument$data,
  ArgumentCard_argument$ref,
} from '~relay/ArgumentCard_argument.graphql';
import type {
  DebateStepPageArgumentsPagination_viewer,
  DebateStepPageArgumentsPagination_viewer$key,
} from '~relay/DebateStepPageArgumentsPagination_viewer.graphql';
import AppBox from '~/components/Ui/Primitives/AppBox';
import ArgumentCard from '~/components/Debate/ArgumentCard/ArgumentCard';
import type { RelayHookPaginationProps, ConnectionMetadata } from '~/types';
import ModalModerateArgument, {
  type ModerateArgument,
} from '~/components/Debate/Page/Arguments/ModalModerateArgument';
import ModalReportArgument from '~/components/Debate/Page/Arguments/ModalReportArgument';
import ModalDeleteArgument from '~/components/Debate/Page/Arguments/ModalDeleteArgument';
import { formatConnectionPath } from '~/shared/utils/relay';
import type { ArgumentReported } from '~/components/Debate/Page/Arguments/ModalReportArgument';

type Props = {|
  +debate: DebateStepPageArgumentsPagination_debate$key & { +id: string },
  +viewer: ?DebateStepPageArgumentsPagination_viewer$key,
  +handleChange: ({ ...RelayHookPaginationProps, hasMore: boolean }) => void,
  +viewerUnpublishedArgument: ?{
    +$data?: ArgumentCard_argument$data,
    +$fragmentRefs: ArgumentCard_argument$ref,
    +id: string,
  },
|};

export const CONNECTION_NODES_PER_PAGE = 8;

const FRAGMENT = graphql`
  fragment DebateStepPageArgumentsPagination_debate on Debate
    @argumentDefinitions(
      first: { type: "Int", defaultValue: 3 }
      cursor: { type: "String" }
      value: { type: "ForOrAgainstValue!" }
      orderBy: { type: "DebateArgumentOrder" }
      isAuthenticated: { type: "Boolean!" }
    ) {
    id
    arguments(
      value: $value
      first: $first
      after: $cursor
      orderBy: $orderBy
      isPublished: true
      isTrashed: false
    ) @connection(key: "DebateStepPageArgumentsPagination_arguments", filters: ["value"]) {
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
): {|
  cursor: ?string,
  first: ?string,
  isAuthenticated: boolean,
  debateId: string,
  orderBy: { field: string, direction: string },
|} => {
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
  // $FlowFixMe We need to wait for relay 11
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
  // $FlowFixMe We need to wait for relay 11
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
  viewerUnpublishedArgument,
}: Props): React.Node => {
  const [argumentsQuery, paginationProps]: [
    DebateStepPageArgumentsPagination_debate,
    RelayHookPaginationProps,
  ] = usePagination(FRAGMENT, debate);
  const viewer: ?DebateStepPageArgumentsPagination_viewer = useFragment(
    VIEWER_FRAGMENT,
    viewerFragment,
  );
  const [argumentReported, setArgumentReported] = React.useState<?ArgumentReported>(null);
  const [moderateArgumentModal, setModerateArgumentModal] = React.useState<?ModerateArgument>(null);
  const [deleteModalInfo, setDeleteModalInfo] = React.useState<?{
    id: string,
    type: 'FOR' | 'AGAINST',
    debateUrl: string,
  }>(null);

  if (handleChange) handleChange({ ...paginationProps, hasMore: paginationProps.hasMore() });

  if (!debate || !argumentsQuery) return null;
  const debateArguments = argumentsQuery?.arguments.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean);

  return (
    <>
      {viewerUnpublishedArgument && (
        <AppBox key={viewerUnpublishedArgument.id} marginBottom={6}>
          <ArgumentCard
            argument={viewerUnpublishedArgument}
            viewer={viewer}
            setArgumentReported={setArgumentReported}
            setModerateArgumentModal={setModerateArgumentModal}
            setDeleteModalInfo={setDeleteModalInfo}
          />
        </AppBox>
      )}
      {debateArguments?.map(argument => (
        <AppBox key={argument.id} marginBottom={6}>
          <ArgumentCard
            argument={argument}
            viewer={viewer}
            setArgumentReported={setArgumentReported}
            setModerateArgumentModal={setModerateArgumentModal}
            setDeleteModalInfo={setDeleteModalInfo}
          />
        </AppBox>
      ))}
      {moderateArgumentModal && (
        <ModalModerateArgument
          argument={moderateArgumentModal}
          onClose={() => setModerateArgumentModal(null)}
          relayConnection={[
            formatConnectionPath(
              ['client', moderateArgumentModal.debateId],
              'DebateStepPageArgumentsPagination_arguments',
              `(value:"${moderateArgumentModal.forOrAgainst}")`,
            ),
          ]}
        />
      )}
      {argumentReported && (
        <ModalReportArgument
          argument={argumentReported}
          onClose={() => setArgumentReported(null)}
        />
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
