import { Box, Grid } from '@cap-collectif/ui'
import * as React from 'react'
import { graphql, usePaginationFragment } from 'react-relay'
import { VoteStepProposalsList_proposalStep$key } from '@relay/VoteStepProposalsList_proposalStep.graphql'
import ProposalCard from '@components/FrontOffice/ProposalCard/ProposalCard'
import VoteStepEmptyList from './VoteStepEmptyList'
import { useQueryState } from 'nuqs'
import { exportLatLngBounds } from '@utils/leaflet'

type TemplateColumns = {
  base: string
  tablet: string
  desktop: string
}

type Props = {
  step: VoteStepProposalsList_proposalStep$key;
  templateColumns: TemplateColumns
  triggerRequirementModal: (id: string) => void
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
    )
      @connection(
        key: "ProposalsList_proposals"
        filters: ["term", "orderBy", "userType", "theme", "category", "district", "status", "geoBoundingBox"]
      ) {
      edges {
        node {
          id
          ...ProposalCard_proposal @arguments(isAuthenticated: $isAuthenticated)
        }
      }
    }
    ...ProposalCard_step @arguments(isAuthenticated: $isAuthenticated)
  }
`

export const VoteStepProposalsList: React.FC<Props> = ({ step: stepKey, templateColumns, triggerRequirementModal }) => {
  const { data, refetch } = usePaginationFragment(PROPOSALS_FRAGMENT, stepKey)

  const [latlngBounds] = useQueryState('latlngBounds')
  const [listView] = useQueryState('list_view', { defaultValue: 'grid' })
  const [isMapShown] = useQueryState('map_shown')

  const itemRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({})
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  const [selectedId, setSelectedId] = React.useState<string | null>(null)

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
        refetch({ geoBoundingBox }, { fetchPolicy: 'network-only' })
      }
    }, 500)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [latlngBounds, refetch])

  React.useEffect(() => {
    const handler = (e: CustomEvent) => {
      setSelectedId(e.detail)
    }
    window.addEventListener('proposal-selected', handler)
    return () => window.removeEventListener('proposal-selected', handler)
  }, [])

  React.useEffect(() => {
    if (selectedId && itemRefs.current[selectedId]) {
      itemRefs.current[selectedId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [selectedId])

  // Reset selection when map is hidden or list view changes
  React.useEffect(() => {
    setSelectedId(null)
  }, [isMapShown, listView])

  const proposalsLength = data?.proposals?.edges?.length

  const gridTemplateColumns =
    listView === 'grid' ? [templateColumns.base, templateColumns.tablet, templateColumns.desktop] : '1fr'

  return proposalsLength ? (
    <Grid templateColumns={gridTemplateColumns} gap="lg" justifyItems="stretch">
      {data.proposals.edges.map(({ node }) => (
        <Box
          key={node.id}
          ref={el => {
            itemRefs.current[node.id] = el
          }}
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
  ) : (
    <VoteStepEmptyList />
  )
}
export default VoteStepProposalsList
