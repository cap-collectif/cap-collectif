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
import LocateAndZoomControl from '@components/FrontOffice/Leaflet/LocateAndZoomControl'
import L from 'leaflet'
import * as React from 'react'
import { MapContainer, Marker, useMap, useMapEvents } from 'react-leaflet'
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import { renderToString } from 'react-dom/server'
import { useIntl } from 'react-intl'

const MAX_MAP_ZOOM = 18
const DEFAULT_CENTER = { lat: 48.8586047, lng: 2.3137325 }

const markerIcon = L.divIcon({
  className: 'preview-icn',
  html: renderToString(<Icon name={CapUIIcon.PinFull} size={CapUIIconSize.Md} color="primary.base" />),
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
}

const MapEvents: React.FC<MapEventsProps> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
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
}

const LocateOnMapModal: React.FC<Props> = ({ show, onClose, onConfirm, initialAddress, mapCenter }) => {
  const intl = useIntl()
  const [selectedAddress, setSelectedAddress] = React.useState<AddressComplete | null>(initialAddress)
  const [searchValue, setSearchValue] = React.useState<string>(initialAddress?.formatted_address || '')
  const [flyTarget, setFlyTarget] = React.useState<{ lat: number; lng: number } | null>(null)

  React.useEffect(() => {
    if (show) {
      setSelectedAddress(initialAddress)
      setSearchValue(initialAddress?.formatted_address || '')
      setFlyTarget(null)
    }
  }, [show, initialAddress])

  const center = initialAddress?.geometry?.location || mapCenter || DEFAULT_CENTER

  const handleMapClick = async (lat: number, lng: number) => {
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
        setSelectedAddress(addressComplete)
        setSearchValue(addressComplete.formatted_address)
        setFlyTarget(addressComplete.geometry.location)
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
        <Box position="relative" height="550px">
          <Box position="absolute" top="10px" left="10px" zIndex={1001} width="66%" maxWidth="480px">
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
            style={{ width: '100%', height: '100%' }}
          >
            <InvalidateSizeOnMount />
            <MapEvents onMapClick={handleMapClick} />
            <FlyToPosition position={flyTarget} />
            <CapcoTileLayer />
            <LocateAndZoomControl />
            {selectedAddress && (
              <Marker
                position={[selectedAddress.geometry.location.lat, selectedAddress.geometry.location.lng]}
                icon={markerIcon}
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
