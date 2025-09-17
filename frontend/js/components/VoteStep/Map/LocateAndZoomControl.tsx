import * as React from 'react'
import L from 'leaflet'
import { CapUIIcon, CapUIIconSize, Flex, Icon } from '@cap-collectif/ui'
import { Marker, useMapEvents } from 'react-leaflet'
import LeafletControl from './LeafletControl'
import type { MapCenterObject } from '~/components/Proposal/Map/Map.types'
const svgIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" version="1.1" viewBox="-24 -24 48 48">
          <circle id="circle1" r="7" style="animation-delay: -3s" />
          <circle id="circle2" r="7" style="animation-delay: -2s"/>
          <circle id="circle3" r="7" style="animation-delay: -1s"/>
          <circle id="circle4" r="7" style="animation-delay: -0s"/>
        </svg>`,
  className: 'location-circle',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
})

const ControlButton = ({
  icon,
  ...rest
}: {
  readonly mb?: number
  readonly onClick: () => void
  readonly icon: string
}) => (
  <Flex
    borderRadius="normal"
    as="button"
    bg="white"
    align="center"
    justifyContent="center"
    borderColor="gray.300"
    borderStyle="solid"
    {...rest}
    p={0}
  >
    <Icon name={icon} size={CapUIIconSize.Md} color="gray.700" />
  </Flex>
)

const LocateAndZoomControl = () => {
  const [position, setPosition] = React.useState(null)
  const map: L.Map = useMapEvents({
    locationfound(e: { latlng: MapCenterObject }) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, 16) // TODO : choose a zoom level
    },
  })
  return (
    <>
      <LeafletControl position="topright">
        <Flex direction="column" m="1rem">
          <ControlButton
            mb={4}
            onClick={() => {
              map.locate()
            }}
            icon={CapUIIcon.LocationTarget}
          />
          <ControlButton
            mb={1}
            onClick={() => {
              map.zoomIn()
            }}
            icon={CapUIIcon.Add}
          />
          <ControlButton
            onClick={() => {
              map.zoomOut()
            }}
            icon={CapUIIcon.Minus}
          />
        </Flex>
      </LeafletControl>
      {position ? <Marker position={position} icon={svgIcon} /> : null}
    </>
  )
}

export default LocateAndZoomControl
