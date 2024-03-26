import React from 'react'
import { renderToString } from 'react-dom/server'
import { MapContainer, Marker } from 'react-leaflet'
import { GestureHandling } from 'leaflet-gesture-handling'
import config from '~/config'
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon'
import { MAX_MAP_ZOOM } from '~/utils/styles/variables'
import 'leaflet/dist/leaflet.css'
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css'
import { colors as dsColors } from '~/styles/modules/colors'
import { colors } from '~/utils/colors'
import type { AddressComplete } from '~/components/Form/Address/Address.type'
import CapcoTileLayer from '~/components/Utils/CapcoTileLayer'
type Props = {
  readonly address: string | null | undefined
  readonly category: string | null | undefined
  readonly categories: ReadonlyArray<{
    readonly id: string
    readonly name: string
    readonly color: string
    readonly icon: string | null | undefined
  }>
}
let L
export const ProposalFormMapPreview = ({ address, category, categories }: Props) => {
  const mapRef = React.useRef(null)
  const proposalAddress: AddressComplete = JSON.parse(address ? address.substring(1, address.length - 1) : '{}')
  React.useEffect(() => {
    if (config.canUseDOM) {
      L = require('leaflet')

      L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling)
    }
  }, [])
  React.useEffect(() => {
    if (mapRef.current && proposalAddress?.geometry)
      mapRef.current.setView([proposalAddress.geometry.location.lat, proposalAddress.geometry.location.lng])
  }, [proposalAddress])
  if (!L || !address) return null
  const proposalCategory = categories.find(cat => cat.id === category) || {
    color: dsColors.blue[500],
    icon: null,
  }
  return (
    <MapContainer
      whenCreated={map => {
        mapRef.current = map
        setTimeout(() => map.invalidateSize(), 100)
      }}
      doubleClickZoom={false}
      dragging={false}
      touchZoom={false}
      scrollWheelZoom={false}
      zoom={16}
      zoomControl={false}
      center={proposalAddress.geometry.location}
      maxZoom={MAX_MAP_ZOOM}
      css={{
        width: '100%',
        height: 200,
        marginBottom: 12,
      }}
      tap={!L.Browser.mobile}
      gestureHandling
    >
      <CapcoTileLayer />
      <Marker
        position={[proposalAddress.geometry.location.lat, proposalAddress.geometry.location.lng]}
        icon={L.divIcon({
          className: 'preview-icn',
          html: renderToString(
            <>
              <Icon name={ICON_NAME.pin3} size={40} color={proposalCategory.color} />
              {proposalCategory.icon && (
                <Icon
                  name={ICON_NAME[proposalCategory.icon]}
                  size={16}
                  color={colors.white}
                  style={{
                    position: 'absolute',
                    top: 7,
                    left: 12,
                  }}
                />
              )}
            </>,
          ),
          iconSize: [34, 48],
          iconAnchor: [17, 24],
        })}
      />
    </MapContainer>
  )
}
