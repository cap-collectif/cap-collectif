'use client'
import 'leaflet/dist/leaflet.css'

import { Box, Flex, FlexProps } from '@cap-collectif/ui'
import { CapcoTileLayer, parseLatLng, parseLatLngBounds } from '@utils/leaflet'
import { FC, Suspense, useState } from 'react'
import { MapContainer, Popup, useMapEvents } from 'react-leaflet'
import { graphql, useFragment } from 'react-relay'
import { VoteStepMapContainer_proposalStep$key } from '@relay/VoteStepMapContainer_proposalStep.graphql'
import { useVoteStepContext } from '../VoteStepContext'
import useIsMobile from '@shared/hooks/useIsMobile'
import ProposalForm from '../ProposalForm/ProposalForm'
import VoteStepMapMarkers from './VoteStepMapMarkers'
import LocateAndZoomControl, { ChangeSizeButton } from '@components/FrontOffice/Leaflet/LocateAndZoomControl'

export const mapId = 'cap-vote-step-map'
export const MAX_MAP_ZOOM = 18

export const VoteStepMapPlaceholder: FC<FlexProps> = ({ children, ...rest }) => {
  return (
    <Flex
      borderRadius="xs"
      height="100%"
      sx={{ background: 'url(/map_placeholder.jpg)', backgroundSize: 'cover' }}
      alignItems="center"
      justifyContent="center"
      {...rest}
    >
      {children}
    </Flex>
  )
}

const FRAGMENT = graphql`
  fragment VoteStepMapContainer_proposalStep on ProposalStep
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
  ) {
    ...VoteStepMapMarkers_proposalStep
      @arguments(
        count: $count
        term: $term
        cursor: $cursor
        category: $category
        district: $district
        orderBy: $orderBy
        geoBoundingBox: $geoBoundingBox
        theme: $theme
        status: $status
        userType: $userType
      )
    __typename
    form {
      contribuable
      mapCenter {
        lat
        lng
      }
      zoomMap
    }
  }
`

type Props = { step: VoteStepMapContainer_proposalStep$key }

const MapCustomEvents: FC<{ contribuable: boolean }> = ({ contribuable }) => {
  const [position, setPosition] = useState(null)

  const { isCollectStep } = useVoteStepContext()

  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })

  return position && isCollectStep ? (
    <Popup position={position}>
      <ProposalForm disabled={!contribuable} initialPosition={position} />
    </Popup>
  ) : null
}

const VoteStepMapContainer: FC<Props> = ({ step: stepKey }) => {
  const step = useFragment<VoteStepMapContainer_proposalStep$key>(FRAGMENT, stepKey)
  const isMobile = useIsMobile()
  const { filters, isMapExpanded, setIsMapExpanded } = useVoteStepContext()
  const { latlng, latlngBounds } = filters
  const filterBounds = parseLatLngBounds(latlngBounds || '')
  const { form } = step

  const urlCenter = latlng ? parseLatLng(latlng) : null

  const DEFAULT_CENTER = {
    lat: form?.mapCenter?.lat || 48.8586047,
    lng: form?.mapCenter?.lng || 2.3137325,
  }

  const center = urlCenter || {
    lat: DEFAULT_CENTER.lat,
    lng: DEFAULT_CENTER.lng,
  }
  const zoom = urlCenter ? 14 : filterBounds && !isMobile ? null : form?.zoomMap || 10

  return (
    <Box height="100%" borderRadius="xs" overflow="hidden">
      <MapContainer
        id={mapId}
        center={center}
        zoom={zoom}
        maxZoom={MAX_MAP_ZOOM}
        style={{
          height: '100%',
          width: '100%',
        }}
        zoomControl={false}
      >
        <MapCustomEvents contribuable={form?.contribuable} />
        <Suspense fallback={null}>
          <VoteStepMapMarkers step={step} />
        </Suspense>
        <CapcoTileLayer />
        <LocateAndZoomControl>
          <ChangeSizeButton onClick={() => setIsMapExpanded(!isMapExpanded)} />
        </LocateAndZoomControl>
      </MapContainer>
    </Box>
  )
}

export default VoteStepMapContainer
