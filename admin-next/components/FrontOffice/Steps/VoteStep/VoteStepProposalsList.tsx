import { Box, Flex, Grid, Spinner } from '@cap-collectif/ui'
import * as React from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { graphql, usePaginationFragment } from 'react-relay'
import { VoteStepProposalsList_proposalStep$key } from '@relay/VoteStepProposalsList_proposalStep.graphql'
import ProposalCard from '@components/FrontOffice/ProposalCard/ProposalCard'
import VoteStepEmptyList from './VoteStepEmptyList'
import { useQueryState } from 'nuqs'
import { exportLatLngBounds } from '@utils/leaflet'
import ProjectsListPlaceholder from '@shared/projectCard/ProjectsListSkeleton'
import { VOTE_STEP_PROPOSALS_COUNT } from './VoteStep.queries'

type TemplateColumns = {
  base: string
  tablet: string
  desktop: string
}

type Props = {
  step: VoteStepProposalsList_proposalStep$key
  templateColumns: TemplateColumns
  triggerRequirementModal: (id: string) => void
  selectedId: string | null
  onSelectedIdChange: (id: string | null) => void
}

const PROPOSALS_FRAGMENT = graphql`
  fragment VoteStepProposalsList_proposalStep on ProposalStep
  @argumentDefinitions(
    count: { type: "Int!" }
    cursor: { type: "String" }
    orderBy: { type: "[ProposalOrder]" }
    userType: { type: "ID" }
    theme: { type: "ID" }
    category: { type: "ID" }
    district: { type: "ID" }
    status: { type: "ID" }
    geoBoundingBox: { type: "GeoBoundingBox" }
    term: { type: "String" }
    isAuthenticated: { type: "Boolean!" }
  )
  @refetchable(queryName: "VoteStepWebLayoutQuery") {
    id
    __typename
    ... on CollectStep {
      mainView
    }
    ... on SelectionStep {
      project {
        firstCollectStep {
          mainView
        }
      }
    }
    form {
      objectType
    }
    defaultSort
    proposals(
      first: $count
      after: $cursor
      orderBy: $orderBy
      userType: $userType
      theme: $theme
      category: $category
      district: $district
      status: $status
      geoBoundingBox: $geoBoundingBox
      term: $term
      state: PUBLISHED
    )
      @connection(
        key: "ProposalsList_proposals"
        filters: ["term", "orderBy", "userType", "theme", "category", "district", "status", "geoBoundingBox"]
      ) {
      edges {
        node {
          id
          votes(stepId: $stepId, first: 0) {
            totalCount
            totalPointsCount
          }
          ...ProposalCard_proposal @arguments(isAuthenticated: $isAuthenticated)
        }
      }
    }
    ...ProposalCard_step @arguments(isAuthenticated: $isAuthenticated)
  }
`

export const VoteStepProposalsList: React.FC<Props> = ({
  step: stepKey,
  templateColumns,
  triggerRequirementModal,
  selectedId,
  onSelectedIdChange,
}) => {
  const { data, refetch, loadNext, hasNext, isLoadingNext } = usePaginationFragment(PROPOSALS_FRAGMENT, stepKey)

  const [latlngBounds] = useQueryState('latlngBounds')
  const [sort] = useQueryState('sort')
  const mainView =
    data.__typename === 'CollectStep'
      ? data.mainView
      : data.__typename === 'SelectionStep'
      ? data.project?.firstCollectStep?.mainView
      : undefined
  const defaultView = mainView === 'LIST' ? 'list' : 'grid'
  const [listView] = useQueryState('list_view', { defaultValue: defaultView })
  const [isMapShown] = useQueryState('map_shown')

  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null)
  const hasMountedRef = React.useRef(false)

  const handlerMouseOver = (id: string, content: string | null) => {
    if (id === selectedId) return
    window.dispatchEvent(new CustomEvent('proposal-card-hover', { detail: content }))
  }

  React.useEffect(() => {
    if (latlngBounds === null) return
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      const geoBoundingBox = exportLatLngBounds(latlngBounds)
      if (geoBoundingBox) {
        refetch({ geoBoundingBox, count: VOTE_STEP_PROPOSALS_COUNT, cursor: null }, { fetchPolicy: 'network-only' })
      }
    }, 500)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [latlngBounds, refetch])

  const scrollToSelectedCard = React.useCallback((card: HTMLDivElement | null) => {
    card?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  // Reset selection when map is hidden or list view changes
  React.useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    onSelectedIdChange(null)
  }, [isMapShown, listView, onSelectedIdChange])

  const proposalsLength = data?.proposals?.edges?.length
  const currentSort = sort ?? (data.defaultSort === 'LEAST_VOTE' ? 'least-votes' : data.defaultSort?.toLowerCase())
  const sortedEdges = React.useMemo(() => {
    const edges = data.proposals?.edges ?? []
    if (!['votes', 'least-votes', 'points', 'least-points'].includes(currentSort ?? '')) return edges

    const isPointsSort = currentSort?.includes('points')
    const isAscending = currentSort?.startsWith('least')
    return [...edges].sort((first, second) => {
      const firstCount = isPointsSort ? first.node.votes?.totalPointsCount ?? 0 : first.node.votes?.totalCount ?? 0
      const secondCount = isPointsSort ? second.node.votes?.totalPointsCount ?? 0 : second.node.votes?.totalCount ?? 0
      return (firstCount - secondCount) * (isAscending ? 1 : -1)
    })
  }, [currentSort, data.proposals?.edges])

  const gridTemplateColumns =
    listView === 'grid' ? [templateColumns.base, templateColumns.tablet, templateColumns.desktop] : '1fr'

  if (!data.proposals) {
    return <ProjectsListPlaceholder count={10} templateColumns={gridTemplateColumns} mt={0} />
  }

  return proposalsLength ? (
    <InfiniteScroll
      initialLoad={false}
      hasMore={hasNext && !isLoadingNext}
      loadMore={() => loadNext(VOTE_STEP_PROPOSALS_COUNT)}
    >
      <Grid id="proposals-list" templateColumns={gridTemplateColumns} gap="lg" justifyItems="stretch">
        {sortedEdges.map(({ node }) => (
          <Box
            key={node.id}
            ref={node.id === selectedId ? scrollToSelectedCard : undefined}
            onMouseEnter={() => handlerMouseOver(node.id, node.id)}
            onMouseLeave={() => handlerMouseOver(node.id, null)}
          >
            <ProposalCard
              proposal={node}
              step={data}
              primaryInfoTag="h2"
              minWidth="unset"
              active={node.id === selectedId}
              triggerRequirementModal={triggerRequirementModal}
            />
          </Box>
        ))}
      </Grid>
      {isLoadingNext && (
        <Flex justify="center" mt="lg">
          <Spinner />
        </Flex>
      )}
    </InfiniteScroll>
  ) : (
    <VoteStepEmptyList objectType={data.form?.objectType} />
  )
}
export default VoteStepProposalsList
