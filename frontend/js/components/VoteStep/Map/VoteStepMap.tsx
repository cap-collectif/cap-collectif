import React, { useRef, useEffect, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { Marker, MapContainer as Map, Popup, GeoJSON } from 'react-leaflet'
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
import { Button, CapUIIcon, CapUIIconSize, Icon, useTheme } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import NewLoginOverlay from '~/components/Utils/NewLoginOverlay'
import ProposalCreateModal from '~/components/Proposal/Create/ProposalCreateModal'
import { formName } from '~/components/Proposal/Form/ProposalForm'
import { useDisclosure } from '@liinkiing/react-hooks'
import { getAddressFromLatLng } from '~/utils/googleMapAddress'
import { convertToGeoJsonStyle, formatGeoJsons } from '~/utils/geojson'
import convertIconToDs from '~/utils/convertIconToDs'

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

const size = 40

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
  const [popoverLatLng, setPopoverLatLng] = useState({
    lat: 0,
    lng: 0,
  })
  const isCollectStep = data.form && data.kind === 'collect'
  const geoJsons = formatGeoJsons(proposalForm.districts)

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

  const onPositionChange = (map: L.Map) => {
    const bounds = map.getBounds()
    handleMapPositionChange(
      JSON.stringify({
        topLeft: bounds.getNorthWest(),
        bottomRight: bounds.getSouthEast(),
      }),
    )
  }

  const debouncedOnPositionChange = debounce((map: L.Map) => onPositionChange(map), DELAY_BEFORE_MAP_RELOADING)
  useEventListener(VoteStepEvent.HoverCardStart, e => {
    const proposalId = e?.data?.id
    if (proposalId) setHoveredProposal(proposalId)
  })
  useEventListener(VoteStepEvent.HoverCardEnd, () => {
    setHoveredProposal(null)
  })

  const closePopup = () => {
    if (popupRef.current) popupRef.current.close()
  }

  return (
    <>
      <ProposalCreateModal
        title="proposal.add"
        fullSizeOnMobile
        proposalForm={proposalForm}
        show={isOpen}
        onClose={onClose}
        onOpen={async () => {
          const geoAddr = await getAddressFromLatLng(popoverLatLng)
          dispatch(change(formName, 'address', geoAddr ? JSON.stringify([geoAddr]) : geoAddr))
          dispatch(change(formName, 'addressText', geoAddr ? geoAddr.formatted_address : geoAddr))
        }}
      />
      <MapContainer>
        <Map
          whenCreated={map => {
            mapRef.current = map

            if (!isMobile) {
              // @ts-ignore Use ts leaflet types now that we are in TS
              if (filterBounds && mapRef.current) mapRef.current.fitBounds(boundsToLeaflet(filterBounds))
              else if (mapRef.current) onPositionChange(mapRef.current)
            }
            map.on('moveend', () => {
              closePopup()
              if (mapRef.current) debouncedOnPositionChange(mapRef.current)
            })
            map.on('click', e => {
              if (mapRef.current) setSelectedProposal(null)
              if (isCollectStep && proposalForm?.contribuable) {
                setPopoverLatLng(e?.latlng)
              }
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
          <Popup
            ref={popupRef}
            key="popup-proposal"
            closeButton={false}
            position={popoverLatLng}
            autoPan={false}
            className="popup-proposal"
          >
            <NewLoginOverlay placement="top">
              <Button
                opacity={!proposalForm?.contribuable ? 0.5 : 1}
                variantSize="small"
                onClick={onOpen}
                disabled={!proposalForm?.contribuable}
              >
                {intl.formatMessage({
                  id: 'proposal.add',
                })}
              </Button>
            </NewLoginOverlay>
          </Popup>
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
                            name={icon ? CapUIIcon.PinFull : CapUIIcon.Pin}
                            size={CapUIIconSize.Sm}
                            color={mark.category?.color || colors['neutral-gray'][800]}
                          />
                          {icon && <Icon name={convertIconToDs(icon)} size={CapUIIconSize.Xs} color="white" />}
                        </>,
                      ),
                      /* <> Keeping it in case IDF
                          <Icon
                            name={ICON_NAME.pin3}
                            size={size}
                            css={{
                              fill: mark.category?.color || ICON_COLOR,
                            }}
                          />
                          {icon && <Icon name={ICON_NAME[icon]} size={16} color="white" />}
                        </>,*/
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
