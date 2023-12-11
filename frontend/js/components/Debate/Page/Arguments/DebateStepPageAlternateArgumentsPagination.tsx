import * as React from 'react'
import { graphql } from 'react-relay'
import { useFragment, usePagination } from 'relay-hooks'
import InfiniteScroll from 'react-infinite-scroller'
import { useMultipleDisclosure } from '@liinkiing/react-hooks'
import { Box, Spinner, Flex } from '@cap-collectif/ui'
import type {
  DebateStepPageAlternateArgumentsPagination_debate,
  DebateStepPageAlternateArgumentsPagination_debate$key,
} from '~relay/DebateStepPageAlternateArgumentsPagination_debate.graphql'
import type {
  DebateStepPageAlternateArgumentsPagination_viewer,
  DebateStepPageAlternateArgumentsPagination_viewer$key,
} from '~relay/DebateStepPageAlternateArgumentsPagination_viewer.graphql'
import ArgumentCard from '~/components/Debate/ArgumentCard/ArgumentCard'
import type { ConnectionMetadata, RelayHookPaginationProps } from '~/types'
import { StyledSlider } from '~/components/Debate/Page/LinkedArticles/DebateStepPageLinkedArticles'
import DebateStepPageArgumentDrawer from '~/components/Debate/Page/Drawers/DebateStepPageArgumentDrawer'
import ModalModerateArgument from '~/components/Debate/Page/Arguments/ModalModerateArgument'
import ModalReportArgument from '~/components/Debate/Page/Arguments/ModalReportArgument'
import ModalDeleteArgument from '~/components/Debate/Page/Arguments/ModalDeleteArgument'
import type { ModerateArgument } from '~/components/Debate/Page/Arguments/ModalModerateArgument'
import { formatConnectionPath } from '~/shared/utils/relay'
import type { ArgumentReported } from '~/components/Debate/Page/Arguments/ModalReportArgument'
type Props = {
  readonly handleChange?: (
    arg0: RelayHookPaginationProps & {
      hasMore: boolean
    },
  ) => void
  readonly debate: DebateStepPageAlternateArgumentsPagination_debate$key
  readonly viewer: DebateStepPageAlternateArgumentsPagination_viewer$key | null | undefined
  readonly preview?: boolean
}

export const CONNECTION_NODES_PER_PAGE = 8
const MOBILE_PREVIEW_MAX_ARGUMENTS = 4
export const FRAGMENT = graphql`
  fragment DebateStepPageAlternateArgumentsPagination_debate on Debate
  @argumentDefinitions(
    orderBy: { type: "DebateArgumentOrder!" }
    first: { type: "Int", defaultValue: 2 }
    cursor: { type: "String" }
    isAuthenticated: { type: "Boolean!" }
  ) {
    id
    viewerUnpublishedArgument @include(if: $isAuthenticated) {
      id
      ...DebateStepPageArgumentDrawer_argument @arguments(isAuthenticated: $isAuthenticated)
      ...ArgumentCard_argument @arguments(isAuthenticated: $isAuthenticated)
    }
    alternateArguments(first: $first, after: $cursor, orderBy: $orderBy, isTrashed: false, isPublished: true)
      @connection(key: "DebateStepPageAlternateArgumentsPagination_alternateArguments", filters: []) {
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
`
const VIEWER_FRAGMENT = graphql`
  fragment DebateStepPageAlternateArgumentsPagination_viewer on User {
    ...ArgumentCard_viewer
    ...DebateStepPageArgumentDrawer_viewer
  }
`

const getVariables = (
  props: {
    id: string
  },
  { count, cursor }: ConnectionMetadata,
  fragmentVariables: {
    orderBy: {
      field: string
      direction: string
    }
    isAuthenticated: boolean
  },
): {
  readonly cursor: string | null | undefined
  readonly first: string | null | undefined
  readonly isAuthenticated: boolean
  readonly debateId: string
  readonly orderBy: {
    field: string
    direction: string
  }
} => {
  return {
    first: count,
    cursor,
    debateId: props?.id,
    orderBy: fragmentVariables.orderBy,
    isAuthenticated: fragmentVariables.isAuthenticated,
  }
}

export const CONNECTION_CONFIG = {
  getVariables,
  query: graphql`
    query DebateStepPageAlternateArgumentsPaginationRefetchYesQuery(
      $debateId: ID!
      $first: Int!
      $cursor: String
      $orderBy: DebateArgumentOrder!
      $isAuthenticated: Boolean!
    ) {
      debate: node(id: $debateId) {
        ...DebateStepPageAlternateArgumentsPagination_debate
          @arguments(isAuthenticated: $isAuthenticated, first: $first, cursor: $cursor, orderBy: $orderBy)
      }
    }
  `,
}
export const DebateStepPageAlternateArgumentsPagination = ({
  debate: debateFragment,
  viewer: viewerFragment,
  handleChange,
  preview = false,
}: Props): JSX.Element => {
  const { onClose, onOpen, isOpen } = useMultipleDisclosure({})
  const [debate, paginationProps]: [DebateStepPageAlternateArgumentsPagination_debate, RelayHookPaginationProps] =
    usePagination(FRAGMENT, debateFragment)
  const viewer: DebateStepPageAlternateArgumentsPagination_viewer | null | undefined = useFragment(
    VIEWER_FRAGMENT,
    viewerFragment,
  )
  const [argumentReported, setArgumentReported] = React.useState<ArgumentReported | null | undefined>(null)
  const [moderateArgumentModal, setModerateArgumentModal] = React.useState<ModerateArgument | null | undefined>(null)
  const [deleteModalInfo, setDeleteModalInfo] = React.useState<
    | {
        id: string
        type: 'FOR' | 'AGAINST'
        debateUrl: string
        hash?: string | null | undefined
      }
    | null
    | undefined
  >(null)
  if (handleChange) handleChange({ ...paginationProps, hasMore: paginationProps.hasMore() })
  if (!debateFragment || !debate) return null
  const debateArguments =
    debate?.alternateArguments.edges
      ?.filter(Boolean)
      .map(edge => edge.node)
      .reduce((prev, current) => [...prev, current.for, current.against], [])
      .filter(Boolean) ?? []
  const viewerUnpublishedArgument = debate?.viewerUnpublishedArgument
  return (
    <>
      {preview ? (
        <Box width="100%">
          <StyledSlider
            {...{
              infinite: false,
              dots: true,
              slidesToScroll: 1,
              slidesToShow: 1,
              arrows: false,
            }}
          >
            {viewerUnpublishedArgument && (
              <React.Fragment key={viewerUnpublishedArgument.id}>
                <DebateStepPageArgumentDrawer
                  key={`drawer-${viewerUnpublishedArgument.id}`}
                  argument={viewerUnpublishedArgument}
                  viewer={viewer}
                  isOpen={isOpen(`drawer-${viewerUnpublishedArgument.id}`)}
                  onClose={onClose(`drawer-${viewerUnpublishedArgument.id}`)}
                />
                <ArgumentCard
                  height="100%"
                  onReadMore={onOpen(`drawer-${viewerUnpublishedArgument.id}`)}
                  isMobile
                  argument={viewerUnpublishedArgument}
                  viewer={viewer}
                  setArgumentReported={setArgumentReported}
                  setModerateArgumentModal={setModerateArgumentModal}
                  setDeleteModalInfo={setDeleteModalInfo}
                />
              </React.Fragment>
            )}
            {debateArguments.slice(0, MOBILE_PREVIEW_MAX_ARGUMENTS).map(argument => (
              <React.Fragment key={argument.id}>
                <DebateStepPageArgumentDrawer
                  key={`drawer-${argument.id}`}
                  argument={argument}
                  viewer={viewer}
                  isOpen={isOpen(`drawer-${argument.id}`)}
                  onClose={onClose(`drawer-${argument.id}`)}
                />
                <ArgumentCard
                  height="100%"
                  onReadMore={onOpen(`drawer-${argument.id}`)}
                  isMobile
                  argument={argument}
                  viewer={viewer}
                  setArgumentReported={setArgumentReported}
                  setModerateArgumentModal={setModerateArgumentModal}
                  setDeleteModalInfo={setDeleteModalInfo}
                />
              </React.Fragment>
            ))}
          </StyledSlider>
        </Box>
      ) : (
        <InfiniteScroll
          pageStart={0}
          loadMore={() => {
            paginationProps.loadMore(CONNECTION_CONFIG, CONNECTION_NODES_PER_PAGE, error => {
              // eslint-disable-next-line no-console
              console.error(error)
            })
          }}
          hasMore={paginationProps.hasMore()}
          loader={
            <Flex align="center" justify="center" key={0}>
              <Spinner />
            </Flex>
          }
          useWindow={false}
        >
          {viewerUnpublishedArgument && (
            <Box key={viewerUnpublishedArgument.id} marginBottom={6}>
              <DebateStepPageArgumentDrawer
                key={`drawer-${viewerUnpublishedArgument.id}`}
                argument={viewerUnpublishedArgument}
                viewer={viewer}
                isOpen={isOpen(`drawer-${viewerUnpublishedArgument.id}`)}
                onClose={onClose(`drawer-${viewerUnpublishedArgument.id}`)}
              />
              <ArgumentCard
                key={viewerUnpublishedArgument.id}
                onReadMore={onOpen(`drawer-${viewerUnpublishedArgument.id}`)}
                isMobile
                argument={viewerUnpublishedArgument}
                viewer={viewer}
                bg="neutral-gray.100"
                mb={6}
                setArgumentReported={setArgumentReported}
                setModerateArgumentModal={setModerateArgumentModal}
                setDeleteModalInfo={setDeleteModalInfo}
              />
            </Box>
          )}
          {debateArguments?.map(argument => (
            <Box key={argument.id} marginBottom={6}>
              <DebateStepPageArgumentDrawer
                key={`drawer-${argument.id}`}
                argument={argument}
                viewer={viewer}
                isOpen={isOpen(`drawer-${argument.id}`)}
                onClose={onClose(`drawer-${argument.id}`)}
              />
              <ArgumentCard
                key={argument.id}
                onReadMore={onOpen(`drawer-${argument.id}`)}
                isMobile
                argument={argument}
                viewer={viewer}
                bg="neutral-gray.100"
                mb={6}
                setArgumentReported={setArgumentReported}
                setModerateArgumentModal={setModerateArgumentModal}
                setDeleteModalInfo={setDeleteModalInfo}
              />
            </Box>
          ))}
        </InfiniteScroll>
      )}

      {moderateArgumentModal && (
        <ModalModerateArgument
          argument={moderateArgumentModal}
          onClose={() => setModerateArgumentModal(null)}
          relayConnection={[
            formatConnectionPath(
              ['client', moderateArgumentModal.debateId],
              'DebateStepPageAlternateArgumentsPagination_alternateArguments',
            ),
          ]}
        />
      )}

      {argumentReported && (
        <ModalReportArgument argument={argumentReported} onClose={() => setArgumentReported(null)} />
      )}

      {deleteModalInfo && (
        <ModalDeleteArgument
          debateId={debate.id}
          argumentInfo={deleteModalInfo}
          onClose={() => setDeleteModalInfo(null)}
        />
      )}
    </>
  )
}
export default DebateStepPageAlternateArgumentsPagination
