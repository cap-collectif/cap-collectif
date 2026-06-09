import React, { useRef, useEffect, useState } from 'react'
import { MapContainer as Map, Popup, GeoJSON, useMapEvents } from 'react-leaflet'
import { AnimatePresence, m as motion } from 'framer-motion'
import { GestureHandling } from 'leaflet-gesture-handling'
import { useDispatch } from 'react-redux'
import { change } from 'redux-form'
import 'leaflet/dist/leaflet.css'
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css'
import type { GraphQLTaggedNode } from 'react-relay'
import { graphql, useFragment, usePaginationFragment } from 'react-relay'
import L from 'leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import { MapCenterObject } from '~/components/Proposal/Map/Map.types'
import type { VoteStepMap_step$key } from '~relay/VoteStepMap_step.graphql'
import type { VoteStepMap_viewer$key } from '~relay/VoteStepMap_viewer.graphql'
import { isSafari } from '~/config'
import CapcoTileLayer from '~/components/Utils/CapcoTileLayer'
import { MapContainer } from './Map.style'
import { MAX_MAP_ZOOM } from '~/utils/styles/variables'
import LocateAndZoomControl from './LocateAndZoomControl'
import ProposalMapLoaderPane from '~/components/Proposal/Map/ProposalMapLoaderPane'
import useIsMobile from '~/utils/hooks/useIsMobile'
import { useVoteStepContext } from '~/components/VoteStep/Context/VoteStepContext'
import ProposalMapSelectedView from './ProposalMapSelectedView'
import { useEventListener } from '@shared/hooks/useEventListener'
import {
  VoteStepEvent,
  DELAY_BEFORE_PROPOSAL_REMOVAL,
  boundsToLeaflet,
  parseLatLngBounds,
  DELAY_BEFORE_MAP_RELOADING,
  Bounds,
} from '../utils'
import EmptyList from '../List/EmptyList'
import debounce from '@shared/utils/debounce-promise'
import { Button, useTheme } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import LoginOverlay from '~/components/Utils/LoginOverlay'
import ProposalCreateModal from '~/components/Proposal/Create/ProposalCreateModal'
import { formName } from '~/components/Proposal/Form/ProposalForm'
import { useDisclosure } from '@liinkiing/react-hooks'
import { getAddressFromLatLng } from '~/utils/googleMapAddress'
import { convertToGeoJsonStyle, formatGeoJsons } from '~/utils/geojson'
import VoteStepMapMarker from './VoteStepMapMarker'

type Props = {
  voteStep: VoteStepMap_step$key
  viewer: VoteStepMap_viewer$key
  handleMapPositionChange: (arg0: string) => void
  urlCenter: MapCenterObject | null
  DEFAULT_CENTER: MapCenterObject & {
    zoom: number
  }
  stepId: string
  disabled: boolean
}

type ProposalFormContributionState = {
  readonly contribuable?: boolean | null
} | null | undefined

export const isProposalCreationAvailableOnMap = (
  stepKind: string | null | undefined,
  proposalForm: ProposalFormContributionState,
): boolean => stepKind === 'collect' && Boolean(proposalForm?.contribuable)

export const shouldRenderProposalCreatePopup = (
  stepKind: string | null | undefined,
  proposalForm: ProposalFormContributionState,
  popoverLatLng: L.LatLng | null,
): boolean => isProposalCreationAvailableOnMap(stepKind, proposalForm) && Boolean(popoverLatLng)

const FRAGMENT: GraphQLTaggedNode = graphql`
  fragment VoteStepMap_step on ProposalStep
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
    stepId: { type: "ID!" }
    isAuthenticated: { type: "Boolean!" }
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
      geoBoundingBox: $geoBoundingBox
      term: $term
    ) @connection(key: "VoteStepMap_proposals", filters: []) {
      edges {
        node {
          ...ProposalMapSelectedView_proposal @arguments(isAuthenticated: $isAuthenticated, stepId: $stepId)
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
    ...ProposalMapSelectedView_step @arguments(isAuthenticated: $isAuthenticated)
    kind
    form {
      proposalInAZoneRequired
      districts(order: ALPHABETICAL) {
        displayedOnMap
        geojson
        id
        border {
          id
          enabled
          color
          opacity
          size
        }
        background {
          id
          enabled
          color
          opacity
          size
        }
      }

      contribuable
      ...ProposalCreateModal_proposalForm
    }
  }
`

const FRAGMENT_VIEWER = graphql`
  fragment VoteStepMap_viewer on User @argumentDefinitions(stepId: { type: "ID!" }) {
    ...ProposalMapSelectedView_viewer @arguments(stepId: $stepId)
  }
`

const onPositionChange = (map: L.Map, handleMapPositionChange: any) => {
  const bounds = map.getBounds()
  handleMapPositionChange(
    JSON.stringify({
      topLeft: bounds.getNorthWest(),
      bottomRight: bounds.getSouthEast(),
    }),
  )
}

const debouncedOnPositionChange = debounce(
  (map: L.Map, handleMapPositionChange: (arg: string) => void) => onPositionChange(map, handleMapPositionChange),
  DELAY_BEFORE_MAP_RELOADING,
)

const MapCustomEvents = ({
  handleMapPositionChange,
  setSelectedProposal,
  setPopoverLatLng,
  contribuable,
  filterBounds,
}: {
  handleMapPositionChange: (arg: string) => void
  setSelectedProposal: (proposal: any) => void
  setPopoverLatLng: (arg: L.LatLng) => void
  contribuable: boolean
  filterBounds: Bounds
}) => {
  const isMobile = useIsMobile()
  const map = useMapEvents({
    moveend: () => {
      if (map) debouncedOnPositionChange(map, handleMapPositionChange)
    },
    click: e => {
      if (map) setSelectedProposal(null)
      if (contribuable) setPopoverLatLng(e?.latlng)
    },
  })

  if (!isMobile) {
    if (filterBounds && map) map.fitBounds(boundsToLeaflet(filterBounds) as unknown as L.LatLngBoundsExpression)
    else if (map) onPositionChange(map, handleMapPositionChange)
  }

  useEffect(() => {
    if (!isSafari && !isMobile && map) {
      map.addHandler('gestureHandling', GestureHandling)
      // @ts-expect-error typescript does not see additional handler here
      map.gestureHandling.enable()
    }
  }, [isMobile, map])

  return null
}

export const VoteStepMap = ({
  voteStep,
  viewer: viewerKey,
  handleMapPositionChange,
  urlCenter,
  stepId,
  DEFAULT_CENTER,
  disabled,
}: Props) => {
  const intl = useIntl()
  const mapRef = useRef<L.Map>(null)
  const popupRef = useRef(null)
  const isMobile = useIsMobile()
  const { filters } = useVoteStepContext()
  const { latlngBounds } = filters
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [hoveredProposal, setHoveredProposal] = useState(null)
  const filterBounds = parseLatLngBounds(latlngBounds || '')
  const { colors } = useTheme()
  const { data, loadNext, hasNext, refetch, isLoadingNext } = usePaginationFragment(FRAGMENT, voteStep)
  const viewer = useFragment(FRAGMENT_VIEWER, viewerKey)
  const markers =
    data.proposals.edges
      ?.map(edge => edge?.node)
      .filter(Boolean)
      .filter(proposal => !!(proposal?.address && proposal.address.lat && proposal.address.lng)) || []
  const proposal = data.proposals.edges?.map(edge => edge?.node).find(p => p?.id === selectedProposal)
  const proposalForm = data.form
  const dispatch = useDispatch()
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const [popoverLatLng, setPopoverLatLng] = useState<L.LatLng | null>(null)
  const isCollectStep = data.kind === 'collect'
  const canCreateProposalOnMap = isProposalCreationAvailableOnMap(data.kind, proposalForm)
  const shouldDisplayProposalCreatePopup = shouldRenderProposalCreatePopup(data.kind, proposalForm, popoverLatLng)
  const geoJsons = formatGeoJsons(proposalForm.districts)

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

  useEventListener(VoteStepEvent.HoverCardStart, e => {
    const proposalId = e?.data?.id
    if (proposalId) setHoveredProposal(proposalId)
  })
  useEventListener(VoteStepEvent.HoverCardEnd, () => {
    setHoveredProposal(null)
  })

  return (
    <>
      {isCollectStep && proposalForm ? (
        <ProposalCreateModal
          title="proposal.add"
          fullSizeOnMobile
          proposalForm={proposalForm}
          show={isOpen}
          onClose={onClose}
          onOpen={async () => {
            if (!popoverLatLng) return
            const geoAddr = await getAddressFromLatLng(popoverLatLng)
            dispatch(change(formName, 'address', geoAddr ? JSON.stringify([geoAddr]) : geoAddr))
            dispatch(change(formName, 'addressText', geoAddr ? geoAddr.formatted_address : geoAddr))
          }}
        />
      ) : null}
      <MapContainer>
        <Map
          id="map"
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
        >
          <MapCustomEvents
            handleMapPositionChange={handleMapPositionChange}
            setPopoverLatLng={setPopoverLatLng}
            contribuable={canCreateProposalOnMap}
            setSelectedProposal={setSelectedProposal}
            filterBounds={filterBounds}
          />
          <CapcoTileLayer />
          {shouldDisplayProposalCreatePopup && popoverLatLng ? (
            <Popup
              ref={popupRef}
              key="popup-proposal"
              position={popoverLatLng}
              autoPan={false}
              className="popup-proposal"
            >
              <LoginOverlay placement="top">
                <Button variantSize="small" onClick={onOpen}>
                  {intl.formatMessage({
                    id: 'proposal.add',
                  })}
                </Button>
              </LoginOverlay>
            </Popup>
          ) : null}
          <MarkerClusterGroup
            spiderfyOnMaxZoom
            showCoverageOnHover={false}
            zoomToBoundsOnClick
            spiderfyDistanceMultiplier={4}
            maxClusterRadius={30}
          >
            {markers?.length > 0 &&
              markers.map(mark => {
                const icon = mark.category?.icon
                const isSelected = selectedProposal === mark.id
                const isActive = isSelected || hoveredProposal === mark.id

                return (
                  <VoteStepMapMarker
                    key={mark.id}
                    id={mark.id}
                    lat={mark.address.lat}
                    lng={mark.address.lng}
                    icon={icon}
                    isActive={isActive}
                    isSelected={isSelected}
                    setSelectedProposal={setSelectedProposal}
                    color={mark.category?.color || colors['neutral-gray'][800]}
                  />
                )
              })}
          </MarkerClusterGroup>
          {geoJsons &&
            geoJsons.map((geoJson, idx) => (
              // @ts-ignore geojson stuff
              <GeoJSON style={convertToGeoJsonStyle(geoJson.style)} key={idx} data={geoJson.district} />
            ))}
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
      {isMobile && !markers.length ? <EmptyList isMapMobileView /> : null}
      {selectedProposal ? (
        // @ts-ignore upgrade framer-motion
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
                viewer={viewer}
                step={data}
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
