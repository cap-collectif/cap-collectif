import { VoteStepMapMarkers_proposalStep$key } from '@relay/VoteStepMapMarkers_proposalStep.graphql'
import useIsMobile from '@shared/hooks/useIsMobile'
import { isValidLatLng } from '@utils/leaflet'
import L from 'leaflet'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import { graphql, usePaginationFragment } from 'react-relay'
import MobileProposalCard from './MobileProposalCard'
import ProposalMarker from './ProposalMarker'
import VoteStepMapBoundsHandler from './VoteStepMapBoundsHandler'

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
    state: { type: "ProposalsState" }
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
      state: $state
      geoBoundingBox: $geoBoundingBox
      term: $term
    )
      @connection(
        key: "VoteStepMapMarkers_entity"
        filters: ["term", "orderBy", "userType", "theme", "category", "district", "status", "state", "geoBoundingBox"]
      ) {
      edges {
        node {
          id
          address {
            lat
            lng
          }
          ...ProposalMarker_proposal
          ...MobileProposalCard_proposal
        }
      }
    }
  }
`

const VoteStepMapMarkers: FC<Props> = ({ step: stepKey }) => {
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(MARKERS_FRAGMENT, stepKey)
  const isMobile = useIsMobile()
  const intl = useIntl()
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null)

  // Same icon as the markercluster default one, with an accessible name ("7 propositions" instead of "7")
  const createClusterIcon = useCallback(
    (cluster: { getChildCount: () => number }) => {
      const childCount = cluster.getChildCount()
      const size = childCount < 10 ? 'small' : childCount < 100 ? 'medium' : 'large'
      const label = intl.formatMessage({ id: 'count-proposal' }, { num: childCount })
      return new L.DivIcon({
        html: `<div><span aria-hidden="true">${childCount}</span><span class="sr-only">${label}</span></div>`,
        className: `marker-cluster marker-cluster-${size}`,
        iconSize: new L.Point(40, 40),
      })
    },
    [intl],
  )

  useEffect(() => {
    if (hasNext) loadNext(50)
  }, [hasNext, isLoadingNext, loadNext])

  // Listen to proposal-selected event (only for mobile card display)
  useEffect(() => {
    if (!isMobile) return
    const handler = (e: CustomEvent<string | null>) => setSelectedProposalId(e.detail)
    window.addEventListener('proposal-selected', handler as EventListener)
    return () => window.removeEventListener('proposal-selected', handler as EventListener)
  }, [isMobile])

  const proposals = useMemo(
    () => data.entity.edges?.map(edge => edge?.node).filter(node => isValidLatLng(node?.address)) || [],
    [data.entity.edges],
  )

  const selectedProposal = useMemo(
    () => proposals.find(p => p.id === selectedProposalId),
    [proposals, selectedProposalId],
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
        iconCreateFunction={createClusterIcon}
      >
        {proposals.map(proposal => (
          <ProposalMarker key={proposal.id} proposal={proposal} />
        ))}
      </MarkerClusterGroup>
      {isMobile && selectedProposal && <MobileProposalCard proposal={selectedProposal} />}
    </>
  )
}

export default VoteStepMapMarkers
