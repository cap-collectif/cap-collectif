import 'leaflet/dist/leaflet.css'

import { Box } from '@cap-collectif/ui'
import { CapcoTileLayer, parseLatLng, parseLatLngBounds } from '@utils/leaflet'
import { FC, Suspense } from 'react'
import { MapContainer } from 'react-leaflet'
import { graphql, useFragment } from 'react-relay'
import { VoteStepMapContainer_proposalStep$key } from '@relay/VoteStepMapContainer_proposalStep.graphql'
import useIsMobile from '@shared/hooks/useIsMobile'
import VoteStepMapMarkers from './VoteStepMapMarkers'
import LocateAndZoomControl, { ChangeSizeButton } from '@components/FrontOffice/Leaflet/LocateAndZoomControl'
import { parseAsInteger, useQueryState } from 'nuqs'
import MapCustomEvents from './VoteStepMapCustomEvents'

export const mapId = 'cap-vote-step-map'
export const MAX_MAP_ZOOM = 18

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
    ...VoteStepMapCustomEvents_proposalStep
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
      mapCenter {
        lat
        lng
      }
      zoomMap
    }
  }
`

type Props = { step: VoteStepMapContainer_proposalStep$key }

const VoteStepMapContainer: FC<Props> = ({ step: stepKey }) => {
  const step = useFragment<VoteStepMapContainer_proposalStep$key>(FRAGMENT, stepKey)
  const isMobile = useIsMobile()
  const [latlngBounds] = useQueryState('latlngBounds')
  const [latlng] = useQueryState('latlng')
  const [isMapExpanded, setIsMapExpanded] = useQueryState('map_expanded', parseAsInteger)

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
    <Box
      height="100%"
      borderRadius="xs"
      overflow="hidden"
      sx={{
        '.leaflet-card-popup .leaflet-popup-content-wrapper': { borderRadius: '8px' },
        '.leaflet-card-popup .leaflet-popup-content': { margin: 0 },
      }}
    >
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
        <MapCustomEvents step={step} />
        <Suspense fallback={null}>
          <VoteStepMapMarkers step={step} />
        </Suspense>
        <CapcoTileLayer />
        <LocateAndZoomControl>
          <ChangeSizeButton onClick={() => setIsMapExpanded(isMapExpanded == 1 ? 0 : 1)} />
        </LocateAndZoomControl>
      </MapContainer>
    </Box>
  )
}

export default VoteStepMapContainer
