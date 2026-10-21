import 'leaflet/dist/leaflet.css'

import type { AddressComplete } from '@cap-collectif/form'
import { Box, CapUIIcon, CapUIIconSize, Icon } from '@cap-collectif/ui'
import convertIconToDs from '@shared/utils/convertIconToDs'
import { CapcoTileLayer } from '@utils/leaflet'
import L from 'leaflet'
import * as React from 'react'
import { MapContainer, Marker, useMap } from 'react-leaflet'
import { renderToString } from 'react-dom/server'

type Props = {
  address: AddressComplete
  category?: { color?: string | null; icon?: string | null } | null
}

const coordinate = (value: number | (() => number)) => (typeof value === 'function' ? value() : value)

const MapCenterUpdater = ({ address }: Pick<Props, 'address'>) => {
  const map = useMap()

  React.useEffect(() => {
    map.setView([coordinate(address.geometry.location.lat), coordinate(address.geometry.location.lng)])
  }, [address, map])

  return null
}

const AddressMapPreview = ({ address, category }: Props) => {
  const markerColor = category?.color || '#006CE0'
  const markerIcon = L.divIcon({
    className: 'preview-icn proposal-address-pin',
    html: renderToString(
      <>
        <Icon
          name={category?.icon ? CapUIIcon.PinFull : CapUIIcon.Pin}
          size={CapUIIconSize.Xl}
          color={markerColor}
          style={{ color: markerColor, height: 40, width: 40 }}
        />
        {category?.icon && <Icon name={convertIconToDs(category.icon)} size={CapUIIconSize.Sm} color="white" />}
      </>,
    ),
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  })

  const { lat: rawLat, lng: rawLng } = address.geometry.location
  const lat = coordinate(rawLat)
  const lng = coordinate(rawLng)

  return (
    <Box height="200px" mb={3}>
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        maxZoom={18}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <CapcoTileLayer />
        <MapCenterUpdater address={address} />
        <Marker position={[lat, lng]} icon={markerIcon} />
      </MapContainer>
    </Box>
  )
}

export default AddressMapPreview
