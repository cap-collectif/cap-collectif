import React, { useRef, useEffect, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { Marker, MapContainer as Map } from 'react-leaflet'
import { AnimatePresence, m as motion } from 'framer-motion'
import { GestureHandling } from 'leaflet-gesture-handling'
import 'leaflet/dist/leaflet.css'
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css'
import type { GraphQLTaggedNode } from 'react-relay'
import { graphql, usePaginationFragment } from 'react-relay'
import L from 'leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import type { MapProps, MapCenterObject } from '~/components/Proposal/Map/Map.types'
import type { VoteStepMap_step$key } from '~relay/VoteStepMap_step.graphql'
import { isSafari } from '~/config'
import CapcoTileLayer from '~/components/Utils/CapcoTileLayer'
import { MapContainer } from './Map.style'
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon'
import { MAX_MAP_ZOOM } from '~/utils/styles/variables'
import LocateAndZoomControl from './LocateAndZoomControl'
import ProposalMapLoaderPane from '~/components/Proposal/Map/ProposalMapLoaderPane'
import useIsMobile from '~/utils/hooks/useIsMobile'
import { useVoteStepContext } from '~/components/VoteStep/Context/VoteStepContext'
import ProposalMapSelectedView from './ProposalMapSelectedView'
import { useEventListener } from '~/utils/hooks/useEventListener'
import {
  VoteStepEvent,
  DELAY_BEFORE_PROPOSAL_REMOVAL,
  boundsToLeaflet,
  parseLatLngBounds,
  DELAY_BEFORE_MAP_RELOADING,
  dispatchEvent,
} from '../utils'
import EmptyList from '../List/EmptyList'
import debounce from '~/utils/debounce-promise'
type Props = {
  readonly voteStep: VoteStepMap_step$key
  readonly handleMapPositionChange: (arg0: string) => void
  readonly urlCenter: MapCenterObject | null
  readonly DEFAULT_CENTER: MapCenterObject & {
    zoom: number
  }
  readonly stepId: string
  readonly disabled: boolean
}
const FRAGMENT: GraphQLTaggedNode = graphql`
  fragment VoteStepMap_step on SelectionStep
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
  @refetchable(queryName: "VoteStepMapPaginationQuery") {
    proposals(
      first: $count
      after: $cursor
      orderBy: $orderBy
      userType: $userType
      theme: $theme
      category: $category
      district: $district
      status: $status
      excludeViewerVotes: true
      geoBoundingBox: $geoBoundingBox
      term: $term
    ) @connection(key: "VoteStepMap_proposals", filters: []) {
      edges {
        node {
          ...ProposalMapSelectedView_proposal
          id
          address {
            lat
            lng
          }
          category {
            color
            icon
          }
        }
      }
    }
  }
`
const ICON_COLOR = '#5E5E5E'
const size = 40
export const VoteStepMap = ({
  voteStep,
  handleMapPositionChange,
  urlCenter,
  stepId,
  DEFAULT_CENTER,
  disabled,
}: Props) => {
  const mapRef = useRef(null)
  const isMobile = useIsMobile()
  const { filters } = useVoteStepContext()
  const { latlngBounds } = filters
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [hoveredProposal, setHoveredProposal] = useState(null)
  const filterBounds = parseLatLngBounds(latlngBounds || '')
  const { data, loadNext, hasNext, refetch, isLoadingNext } = usePaginationFragment(FRAGMENT, voteStep)
  const markers =
    data.proposals.edges
      ?.map(edge => edge?.node)
      .filter(Boolean)
      .filter(proposal => !!(proposal?.address && proposal.address.lat && proposal.address.lng)) || []
  const proposal = data.proposals.edges?.map(edge => edge?.node).find(p => p?.id === selectedProposal)
  useEffect(() => {
    L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling)
  }, [])
  useEffect(() => {
    if (hasNext) {
      loadNext(50)
    }
  }, [hasNext, isLoadingNext, loadNext])
  useEffect(() => {
    if (mapRef.current && !filterBounds) {
      mapRef.current.flyTo([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], DEFAULT_CENTER.zoom)
    }
  }, [filterBounds, DEFAULT_CENTER])

  const onPositionChange = (map: MapProps) => {
    const bounds = map.getBounds()
    handleMapPositionChange(
      JSON.stringify({
        topLeft: bounds.getNorthWest(),
        bottomRight: bounds.getSouthEast(),
      }),
    )
  }

  const debouncedOnPositionChange = debounce((map: MapProps) => onPositionChange(map), DELAY_BEFORE_MAP_RELOADING)
  useEventListener(VoteStepEvent.HoverCardStart, e => {
    // @ts-expect-error Event type is too strict in flow
    const proposalId = e?.data?.id
    if (proposalId) setHoveredProposal(proposalId)
  })
  useEventListener(VoteStepEvent.HoverCardEnd, () => {
    setHoveredProposal(null)
  })
  return (
    <>
      <MapContainer>
        <Map
          whenCreated={(map: MapProps) => {
            mapRef.current = map

            if (!isMobile) {
              if (filterBounds && mapRef.current) mapRef.current.fitBounds(boundsToLeaflet(filterBounds))
              else if (mapRef.current) onPositionChange(mapRef.current)
            }

            map.on('moveend', () => {
              if (mapRef.current) debouncedOnPositionChange(mapRef.current)
            })
            map.on('click', () => {
              if (mapRef.current) setSelectedProposal(null)
            })
          }}
          center={
            urlCenter || {
              lat: DEFAULT_CENTER.lat,
              lng: DEFAULT_CENTER.lng,
            }
          }
          zoom={urlCenter ? 14 : filterBounds && !isMobile ? null : DEFAULT_CENTER.zoom}
          maxZoom={MAX_MAP_ZOOM}
          style={{
            height: isMobile ? 'calc(100vh - 128px)' : '100vh',
            width: isMobile ? '100vw' : '100%',
            zIndex: 0,
          }}
          zoomControl={false}
          dragging
          tap={false}
          doubleClickZoom={isMobile}
          gestureHandling={!isSafari && !isMobile}
        >
          <CapcoTileLayer />
          <MarkerClusterGroup
            spiderfyOnMaxZoom
            showCoverageOnHover={false}
            zoomToBoundsOnClick
            spiderfyDistanceMultiplier={4}
            maxClusterRadius={30}
          >
            {markers?.length > 0 &&
              markers.map((mark, idx) => {
                const icon = mark.category?.icon
                const isSelected = selectedProposal === mark.id
                const isActive = isSelected || hoveredProposal === mark.id
                const iconSize = size + 10
                return (
                  <Marker
                    key={idx}
                    position={[mark.address?.lat, mark.address?.lng]}
                    icon={L.divIcon({
                      className: `preview-icn ${isActive ? 'active' : ''}`,
                      html: renderToString(
                        <>
                          <Icon
                            name={ICON_NAME.pin3}
                            size={size}
                            css={{
                              fill: mark.category?.color || ICON_COLOR,
                            }}
                          />
                          {icon && <Icon name={ICON_NAME[icon]} size={16} color="white" />}
                        </>,
                      ),
                      iconSize: [iconSize, iconSize],
                      iconAnchor: [iconSize / 2, iconSize],
                      popupAnchor: [0, -iconSize],
                    })}
                    eventHandlers={{
                      click: () => {
                        if (isMobile) setSelectedProposal(isSelected ? null : mark.id)
                        else
                          dispatchEvent(VoteStepEvent.ClickProposal, {
                            id: mark.id,
                          })
                      },
                    }}
                  />
                )
              })}
          </MarkerClusterGroup>
          {!isMobile ? <LocateAndZoomControl /> : null}
          {hasNext && (
            <ProposalMapLoaderPane
              hasError={false}
              retry={() => {
                refetch({})
              }}
            />
          )}
        </Map>
      </MapContainer>
      {isMobile && !markers.length ? <EmptyList isMapView /> : null}
      {selectedProposal ? (
        <AnimatePresence initial={false} onExitComplete={() => setSelectedProposal(null)}>
          {selectedProposal && proposal ? (
            <motion.div
              key="selectedProposal"
              initial={{
                opacity: 1,
                y: 0,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 321,
              }}
              transition={{
                delay: DELAY_BEFORE_PROPOSAL_REMOVAL * 3,
              }}
            >
              <ProposalMapSelectedView
                onClose={() => setSelectedProposal(null)}
                proposal={proposal}
                stepId={stepId}
                disabled={disabled}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      ) : null}
    </>
  )
}
export default VoteStepMap
