import 'leaflet/dist/leaflet.css'

import type { AddressComplete } from '@cap-collectif/form'
import {
  Box,
  Button,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  Dropdown,
  Flex,
  Heading,
  Icon,
  Input,
  Modal,
} from '@cap-collectif/ui'
import { CapcoTileLayer } from '@utils/leaflet'
import convertIconToDs from '@shared/utils/convertIconToDs'
import ProposalMapDiscoverPane from '@components/FrontOffice/Leaflet/ProposalMapDiscoverPane'
import { convertToGeoJsonStyle, formatGeoJsons } from '@utils/leaflet'
import GeoJsonGeometriesLookup from 'geojson-geometries-lookup'
import L from 'leaflet'
import * as React from 'react'
import { GeoJSON, MapContainer, Marker, useMap, useMapEvents } from 'react-leaflet'
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import { renderToString } from 'react-dom/server'
import { useIntl } from 'react-intl'

const MAX_MAP_ZOOM = 18
const DEFAULT_CENTER = { lat: 48.8586047, lng: 2.3137325 }

const getMarkerIcon = (category: Props['category']) =>
  L.divIcon({
    className: 'proposal-address-pin',
    html: renderToString(
      <>
        <Icon
          name={category?.icon ? CapUIIcon.PinFull : CapUIIcon.Pin}
          size={CapUIIconSize.Xl}
          color={category?.color || 'primary.base'}
        />
        {category?.icon && <Icon name={convertIconToDs(category.icon)} size={CapUIIconSize.Sm} color="white" />}
      </>,
    ),
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  })

const getAddressFromLatLng = async (lat: number, lng: number): Promise<AddressComplete | null> => {
  try {
    const geocoder = new window.google.maps.Geocoder()
    const response = await geocoder.geocode({ location: { lat, lng } })
    if (response.results?.[0]) {
      return {
        ...response.results[0],
        geometry: {
          ...response.results[0].geometry,
          location: { lat, lng },
        },
      } as unknown as AddressComplete
    }
    return null
  } catch {
    return null
  }
}

type MapEventsProps = {
  onMapClick: (lat: number, lng: number) => void
  onDiscoverPaneClose: () => void
}

const MapEvents: React.FC<MapEventsProps> = ({ onMapClick, onDiscoverPaneClose }) => {
  useMapEvents({
    click(e) {
      onDiscoverPaneClose()
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
    zoomstart: onDiscoverPaneClose,
  })
  return null
}

type FlyToProps = {
  position: { lat: number; lng: number } | null
}

const FlyToPosition: React.FC<FlyToProps> = ({ position }) => {
  const map = useMap()
  React.useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 18)
    }
  }, [position, map])
  return null
}

const InvalidateSizeOnMount: React.FC = () => {
  const map = useMap()
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      map.invalidateSize()
    }, 100)
    return () => clearTimeout(timeout)
  }, [map])
  return null
}

type Props = {
  show: boolean
  onClose: () => void
  onConfirm: (address: AddressComplete) => void
  initialAddress: AddressComplete | null
  mapCenter: { lat: number; lng: number } | null
  category: { color?: string | null; icon?: string | null } | null
  proposalInAZoneRequired: boolean
  districts: any[]
  onDistrictChange: (district: string | null) => void
}

const LocateOnMapModal: React.FC<Props> = ({
  show,
  onClose,
  onConfirm,
  initialAddress,
  mapCenter,
  category,
  proposalInAZoneRequired,
  districts,
  onDistrictChange,
}) => {
  const intl = useIntl()
  const [selectedAddress, setSelectedAddress] = React.useState<AddressComplete | null>(initialAddress)
  const [searchValue, setSearchValue] = React.useState<string>(initialAddress?.formatted_address || '')
  const [flyTarget, setFlyTarget] = React.useState<{ lat: number; lng: number } | null>(null)
  const [showDiscoverPane, setShowDiscoverPane] = React.useState(!initialAddress)

  React.useEffect(() => {
    if (show) {
      setSelectedAddress(initialAddress)
      setSearchValue(initialAddress?.formatted_address || '')
      setFlyTarget(null)
      setShowDiscoverPane(!initialAddress)
    }
  }, [show, initialAddress])

  const center = initialAddress?.geometry?.location || mapCenter || DEFAULT_CENTER
  const geoJsons = formatGeoJsons(districts)
  const getDistrictAt = (location: { lat: number; lng: number }) =>
    districts.find(district => {
      const [geoJson] = formatGeoJsons([district])
      return (
        geoJson &&
        new GeoJsonGeometriesLookup(geoJson.district).hasContainers({
          type: 'Point',
          coordinates: [location.lng, location.lat],
        })
      )
    })
  const isInZone = (location: { lat: number; lng: number }) => Boolean(getDistrictAt(location))

  const handleMapClick = async (lat: number, lng: number) => {
    if (proposalInAZoneRequired && !isInZone({ lat, lng })) return
    const addr = await getAddressFromLatLng(lat, lng)
    if (addr) {
      setSelectedAddress(addr)
      setSearchValue(addr.formatted_address)
    }
  }

  const handleAddressSelect = async (address: string) => {
    try {
      const results = await geocodeByAddress(address)
      if (results?.[0]) {
        const latLng = await getLatLng(results[0])
        const addressComplete: AddressComplete = {
          ...results[0],
          geometry: {
            ...results[0].geometry,
            location: { lat: latLng.lat, lng: latLng.lng },
          },
        } as unknown as AddressComplete
        if (proposalInAZoneRequired && !isInZone(addressComplete.geometry.location)) return
        setSelectedAddress(addressComplete)
        setSearchValue(addressComplete.formatted_address)
        setFlyTarget(addressComplete.geometry.location)
        setShowDiscoverPane(false)
      }
    } catch (error) {
      console.error('Error geocoding address:', error)
    }
  }

  if (!show) return null

  return (
    <Modal
      show
      ariaLabel={intl.formatMessage({ id: 'front.proposal.locate-on-map' })}
      size={CapUIModalSize.Xl}
      onClose={onClose}
    >
      <Modal.Header>
        <Heading>{intl.formatMessage({ id: 'front.proposal.locate-on-map' })}</Heading>
      </Modal.Header>
      <Modal.Body p={0}>
        <Box position="relative" height={['calc(100vh - 100px)', '550px']}>
          <Box
            position="absolute"
            top="10px"
            left="10px"
            zIndex={1001}
            width={['calc(100% - 20px)', '66%']}
            maxWidth="480px"
          >
            <PlacesAutocomplete value={searchValue} onChange={setSearchValue} onSelect={handleAddressSelect}>
              {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                <Box position="relative">
                  <Input
                    {...getInputProps({
                      placeholder: intl.formatMessage({ id: 'proposal.map.form.placeholder' }),
                    })}
                    width="100%"
                  />
                  {suggestions.length > 0 && (
                    <Dropdown zIndex={1002} width="100%">
                      {suggestions.map(suggestion => (
                        <Dropdown.Item key={suggestion.placeId} {...getSuggestionItemProps(suggestion)}>
                          {suggestion.description}
                        </Dropdown.Item>
                      ))}
                    </Dropdown>
                  )}
                </Box>
              )}
            </PlacesAutocomplete>
          </Box>
          <MapContainer
            center={center}
            zoom={16}
            maxZoom={MAX_MAP_ZOOM}
            zoomControl={false}
            doubleClickZoom={false}
            scrollWheelZoom={false}
            style={{ width: '100%', height: '100%' }}
          >
            <InvalidateSizeOnMount />
            <MapEvents onMapClick={handleMapClick} onDiscoverPaneClose={() => setShowDiscoverPane(false)} />
            <FlyToPosition position={flyTarget} />
            <CapcoTileLayer />
            {geoJsons.map(geoJson => (
              <GeoJSON key={geoJson.id} data={geoJson.district} style={convertToGeoJsonStyle(geoJson.style)} />
            ))}
            {showDiscoverPane && (
              <ProposalMapDiscoverPane
                type="SELECT"
                position="bottomright"
                handleClose={() => setShowDiscoverPane(false)}
              />
            )}
            {selectedAddress && (
              <Marker
                position={[selectedAddress.geometry.location.lat, selectedAddress.geometry.location.lng]}
                icon={getMarkerIcon(category)}
              />
            )}
          </MapContainer>
        </Box>
      </Modal.Body>
      <Modal.Footer>
        <Flex justifyContent="space-between" width="100%">
          <Button leftIcon={CapUIIcon.LongArrowLeft} variant="link" variantColor="primary" onClick={onClose}>
            {intl.formatMessage({ id: 'global.back' })}
          </Button>
          <Button
            disabled={!selectedAddress}
            variantSize="big"
            variant="primary"
            onClick={() => {
              if (selectedAddress) {
                if (proposalInAZoneRequired) {
                  const district = getDistrictAt(selectedAddress.geometry.location)
                  onDistrictChange(district?.id || null)
                }
                onConfirm(selectedAddress)
                onClose()
              }
            }}
          >
            {intl.formatMessage({ id: 'validate-address' })}
          </Button>
        </Flex>
      </Modal.Footer>
    </Modal>
  )
}

export default LocateOnMapModal
