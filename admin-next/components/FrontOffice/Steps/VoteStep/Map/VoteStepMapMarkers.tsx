import { FC, useEffect, useMemo } from 'react'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import { graphql, usePaginationFragment } from 'react-relay'
import { VoteStepMapMarkers_proposalStep$key } from '@relay/VoteStepMapMarkers_proposalStep.graphql'
import VoteStepMapBoundsHandler from './VoteStepMapBoundsHandler'
import ProposalMarker from './ProposalMarker'

type Props = { step: VoteStepMapMarkers_proposalStep$key }

const MARKERS_FRAGMENT = graphql`
  fragment VoteStepMapMarkers_proposalStep on ProposalStep
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
  )
  @refetchable(queryName: "VoteStepMapMarkersQuery") {
    entity: proposals(
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
        key: "VoteStepMapMarkers_entity"
        filters: ["term", "orderBy", "userType", "theme", "category", "district", "status", "geoBoundingBox"]
      ) {
      edges {
        node {
          id
          address {
            lat
            lng
          }
          ...ProposalMarker_proposal
        }
      }
    }
  }
`

const VoteStepMapMarkers: FC<Props> = ({ step: stepKey }) => {
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(MARKERS_FRAGMENT, stepKey)

  useEffect(() => {
    if (hasNext) loadNext(50)
  }, [hasNext, isLoadingNext, loadNext])

  const proposals = useMemo(
    () =>
      data.entity.edges
        ?.map(edge => edge?.node)
        .filter(node => !!(node?.address && node.address.lat && node.address.lng)) || [],
    [data.entity.edges],
  )

  if (!proposals?.length) return null

  return (
    <>
      <VoteStepMapBoundsHandler markers={proposals} />
      <MarkerClusterGroup
        spiderfyOnMaxZoom
        showCoverageOnHover={false}
        zoomToBoundsOnClick
        spiderfyDistanceMultiplier={4}
        maxClusterRadius={30}
      >
        {proposals.map(proposal => (
          <ProposalMarker key={proposal.id} proposal={proposal} />
        ))}
      </MarkerClusterGroup>
    </>
  )
}

export default VoteStepMapMarkers
