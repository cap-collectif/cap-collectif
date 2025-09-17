import React, { useRef } from 'react'
import { MapContainer, Marker, Popup } from 'react-leaflet'
import { useSelector, useDispatch } from 'react-redux'
import { graphql } from 'relay-runtime'
import { FormattedMessage } from 'react-intl'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import L from 'leaflet'
import { GestureHandling } from 'leaflet-gesture-handling'
import 'leaflet/dist/leaflet.css'
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css'
import { useFragment } from 'react-relay'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import type { GlobalState, Dispatch } from '~/types'
import { changeEventSelected } from '~/redux/modules/event'
import type { MapOptions } from '~/components/Proposal/Map/Map.types'
import EventMapPreview from './EventMapPreview/EventMapPreview'
import { MAX_MAP_ZOOM } from '~/utils/styles/variables'
import type { LeafletMap_query$key } from '~relay/LeafletMap_query.graphql'
import { isSafari } from '~/config'
import CapcoTileLayer from '~/components/Utils/CapcoTileLayer'
import FullScreenControl from './FullScreenControl'
import useIsMobile from '~/utils/hooks/useIsMobile'
import { ButtonLocation } from '~/components/Form/Address/Address.style'
import AppBox from '~ui/Primitives/AppBox'

type Props = {
  query: LeafletMap_query$key
  defaultMapOptions: MapOptions
  loading: boolean
  toggleFullScreen: () => void
  isFullScreen?: boolean
}

const FRAGMENT = graphql`
  fragment LeafletMap_query on Query
  @argumentDefinitions(
    count: { type: "Int!" }
    cursor: { type: "String" }
    theme: { type: "ID" }
    district: { type: "ID" }
    project: { type: "ID" }
    locale: { type: "TranslationLocale" }
    search: { type: "String" }
    userType: { type: "ID" }
    isFuture: { type: "Boolean" }
    author: { type: "ID" }
    isRegistrable: { type: "Boolean" }
    orderBy: { type: "EventOrder" }
  ) {
    events(
      first: $count
      after: $cursor
      theme: $theme
      district: $district
      project: $project
      locale: $locale
      search: $search
      userType: $userType
      isFuture: $isFuture
      author: $author
      isRegistrable: $isRegistrable
      orderBy: $orderBy
    ) @connection(key: "EventMap_events", filters: ["isFuture"]) {
      edges {
        node {
          id
          googleMapsAddress {
            lat
            lng
          }
          ...EventMapPreview_event
        }
      }
    }
  }
`

const formatBounds = bounds => {
  if (
    bounds.getNorthEast().lat === bounds.getSouthWest().lat &&
    bounds.getNorthEast().lng === bounds.getSouthWest().lng
  )
    return L.latLngBounds([
      bounds.getCenter(),
      {
        lat: bounds._northEast.lat + 0.001,
        lng: bounds._northEast.lng + 0.001,
      },
      {
        lat: bounds._northEast.lat - 0.001,
        lng: bounds._northEast.lng - 0.001,
      },
    ])
  return bounds
}

const Mark = ({ marker, icon }) => (
  <Marker key={marker.id} position={[marker.googleMapsAddress.lat, marker.googleMapsAddress.lng]} icon={icon}>
    <Popup autoPanPadding={[50, 50]} maxWidth={250} minWidth={250}>
      <EventMapPreview event={marker} />
    </Popup>
  </Marker>
)

const selectedIcon = L.icon({
  iconUrl: '/svg/marker-red.svg',
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [0, -40],
})

const normalIcon = L.icon({
  iconUrl: '/svg/marker.svg',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
})

const Markers = ({ markers }) => {
  const eventSelected: string | null | undefined = useSelector((state: GlobalState) => state.event.eventSelected)

  const getMarkerIcon = marker => {
    if (eventSelected && eventSelected === marker.id) return selectedIcon
    return normalIcon
  }

  return (
    <>
      {markers &&
        markers.edges &&
        markers.edges.length > 0 &&
        markers.edges
          .filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(marker =>
            marker.googleMapsAddress ? <Mark key={marker.id} marker={marker} icon={getMarkerIcon(marker)} /> : null,
          )}
    </>
  )
}

export const LeafletMap = ({
  loading,
  query: queryKey,
  defaultMapOptions,
  toggleFullScreen,
  isFullScreen = false,
}: Props) => {
  const mapRef = useRef<L.Map | null>(null)
  const query = useFragment(FRAGMENT, queryKey)
  const markers = query.events
  const dispatch: Dispatch = useDispatch()
  const isMobile = useIsMobile()

  React.useEffect(() => {
    L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling)
  }, [])

  const markersGroup = []

  if (markers && markers.edges && markers.edges.length > 0) {
    markers.edges
      .filter(Boolean)
      .map(edge => edge.node)
      .filter(Boolean)
      .map(marker => {
        if (marker.googleMapsAddress) {
          markersGroup.push(L.latLng(marker.googleMapsAddress.lat, marker.googleMapsAddress.lng))
        }
      })
  }

  const getLocation = () => {
    window.navigator.geolocation.getCurrentPosition(position => {
      if (position) mapRef.current?.flyTo({ lat: position.coords.latitude, lng: position.coords.longitude }, 18)
    })
  }

  const bounds = L.latLngBounds(markersGroup)
  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      {loading ? (
        <p
          style={{
            position: 'absolute',
            marginLeft: '-50px',
            left: '50%',
            top: '50%',
            color: '#000',
            zIndex: '1500',
          }}
        >
          <FormattedMessage id="global.loading" />
        </p>
      ) : null}

      <MapContainer
        bounds={bounds.isValid() ? formatBounds(bounds) : undefined}
        zoom={defaultMapOptions.zoom}
        maxZoom={MAX_MAP_ZOOM}
        preferCanvas
        id="event-map"
        className={isFullScreen ? 'fullscreen' : null}
        style={
          loading
            ? {
                WebkitFilter: 'blur(5px)',
                zIndex: '0',
              }
            : {
                zIndex: '0',
              }
        }
        scrollWheelZoom={false}
        doubleClickZoom={false}
        gestureHandling={!isSafari}
        tap={false}
        ref={mapRef}
      >
        <CapcoTileLayer />
        <MarkerClusterGroup
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          zoomToBoundsOnClick
          onPopupClose={() => {
            dispatch(changeEventSelected(null))
          }}
          maxClusterRadius={30}
        >
          <Markers markers={markers} />
        </MarkerClusterGroup>
        <AppBox position="absolute" zIndex={999} left={3} top="80px">
          <ButtonLocation
            isEventMap
            isMobile={isMobile}
            type="button"
            onClick={e => {
              e.preventDefault()
              getLocation()
            }}
          >
            <Icon name={ICON_NAME.locationTarget} size={16} color="#707070" />
          </ButtonLocation>
        </AppBox>
        {!isMobile ? <FullScreenControl onClick={toggleFullScreen} /> : null}
      </MapContainer>
    </div>
  )
}
export default LeafletMap
