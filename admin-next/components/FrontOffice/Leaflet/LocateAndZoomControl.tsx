import * as React from 'react'
import L from 'leaflet'
import { CapUIIcon, CapUIIconSize, Flex, FlexProps, Icon } from '@cap-collectif/ui'
import { Marker, useMap, useMapEvents } from 'react-leaflet'
import LeafletControl from './LeafletControl'

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

export const ControlButton: React.FC<FlexProps & { icon: CapUIIcon }> = ({ icon, ...rest }) => (
  <Flex
    borderRadius="normal"
    as="button"
    bg="white"
    align="center"
    justifyContent="center"
    borderColor="gray.300"
    borderStyle="solid"
    {...rest}
    p={2}
  >
    <Icon name={icon} size={CapUIIconSize.Md} color="gray.700" />
  </Flex>
)
export const ChangeSizeButton: React.FC<FlexProps & { icon?: CapUIIcon }> = ({
  icon = CapUIIcon.Preview,
  onClick,
  ...rest
}) => {
  const map = useMap()
  return (
    <ControlButton
      onClick={e => {
        onClick(e)
        setTimeout(() => map.invalidateSize(), 10)
      }}
      icon={icon}
      {...rest}
    />
  )
}

const LocateAndZoomControl: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [position, setPosition] = React.useState(null)
  const map = useMapEvents({
    locationfound(e: { latlng }) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, 16)
    },
  })
  return (
    <>
      <LeafletControl position="topright">
        <Flex direction="column" m="1rem">
          <ControlButton mb={4} onClick={() => map.locate()} icon={CapUIIcon.LocationTarget} />
          <ControlButton mb={1} onClick={() => map.zoomIn()} icon={CapUIIcon.Add} />
          <ControlButton onClick={() => map.zoomOut()} icon={CapUIIcon.Minus} mb={4} />
          {children}
        </Flex>
      </LeafletControl>
      {position ? <Marker position={position} icon={svgIcon} /> : null}
    </>
  )
}

export default LocateAndZoomControl
