// @flow
import * as React from 'react';
import { graphql } from 'react-relay';
import { usePagination } from 'relay-hooks';
import InfiniteScroll from 'react-infinite-scroller';
import { useMultipleDisclosure } from '@liinkiing/react-hooks';
import type {
  DebateStepPageAlternateArgumentsPagination_debate,
  DebateStepPageAlternateArgumentsPagination_debate$key,
} from '~relay/DebateStepPageAlternateArgumentsPagination_debate.graphql';
import AppBox from '~/components/Ui/Primitives/AppBox';
import ArgumentCard from '~/components/Debate/ArgumentCard/ArgumentCard';
import type { ConnectionMetadata, RelayHookPaginationProps } from '~/types';
import Spinner from '~ds/Spinner/Spinner';
import Flex from '~ui/Primitives/Layout/Flex';
import { StyledSlider } from '~/components/Debate/Page/LinkedArticles/DebateStepPageLinkedArticles';
import DebateStepPageArgumentDrawer from '~/components/Debate/Page/Drawers/DebateStepPageArgumentDrawer';

type Props = {|
  +debate: DebateStepPageAlternateArgumentsPagination_debate$key,
  +preview?: boolean,
|};

export const CONNECTION_NODES_PER_PAGE = 2;

const MOBILE_PREVIEW_MAX_ARGUMENTS = 4;

export const FRAGMENT = graphql`
  fragment DebateStepPageAlternateArgumentsPagination_debate on Debate
    @argumentDefinitions(
      orderBy: { type: "DebateArgumentOrder!" }
      first: { type: "Int", defaultValue: 2 }
      cursor: { type: "String" }
      isAuthenticated: { type: "Boolean!" }
    ) {
    id
    alternateArguments(first: $first, after: $cursor, orderBy: $orderBy)
      @connection(
        key: "DebateStepPageAlternateArgumentsPagination_alternateArguments"
        filters: []
      ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          for {
            id
            ...DebateStepPageArgumentDrawer_argument @arguments(isAuthenticated: $isAuthenticated)
            ...ArgumentCard_argument @arguments(isAuthenticated: $isAuthenticated)
          }
          against {
            id
            ...DebateStepPageArgumentDrawer_argument @arguments(isAuthenticated: $isAuthenticated)
            ...ArgumentCard_argument @arguments(isAuthenticated: $isAuthenticated)
          }
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

export const CONNECTION_CONFIG = {
  getVariables,
  query: graphql`
    query DebateStepPageAlternateArgumentsPaginationRefetchYesQuery(
      $debateId: ID!
      $first: Int!
      $cursor: String
      $isAuthenticated: Boolean!
    ) {
      debate: node(id: $debateId) {
        ...DebateStepPageAlternateArgumentsPagination_debate
          @arguments(
            isAuthenticated: $isAuthenticated
            first: $first
            cursor: $cursor
            orderBy: { field: PUBLISHED_AT, direction: DESC }
          )
      }
    }
  `,
};

export const DebateStepPageAlternateArgumentsPagination = ({
  debate: debateFragment,
  preview = false,
}: Props) => {
  const { onClose, onOpen, isOpen } = useMultipleDisclosure({});
  const [debate, { hasMore, loadMore }]: [
    DebateStepPageAlternateArgumentsPagination_debate,
    RelayHookPaginationProps,
  ] = usePagination(FRAGMENT, debateFragment);

  if (!debateFragment || !debate) return null;
  const debateArguments =
    debate?.alternateArguments.edges
      ?.filter(Boolean)
      .map(edge => edge.node)
      .reduce((prev, current) => [...prev, current.for, current.against], [])
      .filter(Boolean) ?? [];

  return preview ? (
    <AppBox width="100%">
      <StyledSlider
        {...{
          infinite: false,
          dots: true,
          slidesToScroll: 1,
          slidesToShow: 1,
          arrows: false,
        }}>
        {debateArguments.slice(0, MOBILE_PREVIEW_MAX_ARGUMENTS).map(argument => (
          <React.Fragment key={argument.id}>
            <DebateStepPageArgumentDrawer
              key={`drawer-${argument.id}`}
              argument={argument}
              isOpen={isOpen(`drawer-${argument.id}`)}
              onClose={onClose(`drawer-${argument.id}`)}
            />
            <ArgumentCard
              onReadMore={onOpen(`drawer-${argument.id}`)}
              isMobile
              argument={argument}
            />
          </React.Fragment>
        ))}
      </StyledSlider>
    </AppBox>
  ) : (
    <InfiniteScroll
      pageStart={0}
      loadMore={() => {
        loadMore(CONNECTION_CONFIG, CONNECTION_NODES_PER_PAGE, error => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
      }}
      hasMore={hasMore()}
      loader={
        <Flex align="center" justify="center" key={0}>
          <Spinner />
        </Flex>
      }
      useWindow={false}>
      {debateArguments?.map(argument => (
        <AppBox key={argument.id} marginBottom={6}>
          <>
            <DebateStepPageArgumentDrawer
              key={`drawer-${argument.id}`}
              argument={argument}
              isOpen={isOpen(`drawer-${argument.id}`)}
              onClose={onClose(`drawer-${argument.id}`)}
            />
            <ArgumentCard
              key={argument.id}
              onReadMore={onOpen(`drawer-${argument.id}`)}
              isMobile
              argument={argument}
              bg="neutral-gray.100"
              mb={6}
            />
          </>
        </AppBox>
      ))}
    </InfiniteScroll>
  );
};

export default DebateStepPageAlternateArgumentsPagination;
