import React, { memo } from 'react'
import { renderToString } from 'react-dom/server'
import { Marker } from 'react-leaflet'
import L from 'leaflet'
import useIsMobile from '~/utils/hooks/useIsMobile'
import { VoteStepEvent, dispatchEvent } from '../utils'

import { CapUIIcon, CapUIIconSize, Icon } from '@cap-collectif/ui'
import convertIconToDs from '@shared/utils/convertIconToDs'

type Props = {
  isActive: boolean
  isSelected: boolean
  setSelectedProposal: (id: string | null) => void
  color: string
  lat: number
  lng: number
  icon: string
  id: string
}

const size = 50

export const VoteStepMapMarker = memo(function VoteStepMapMarker({
  id,
  lat,
  lng,
  color,
  setSelectedProposal,
  isActive,
  isSelected,
  icon,
}: Props) {
  const isMobile = useIsMobile()

  return (
    <Marker
      position={[lat, lng]}
      icon={L.divIcon({
        className: `preview-icn ${isActive ? 'active' : ''}`,
        html: renderToString(
          <>
            <Icon name={icon ? CapUIIcon.PinFull : CapUIIcon.Pin} size={CapUIIconSize.Sm} color={color} />
            {icon && <Icon name={convertIconToDs(icon)} size={CapUIIconSize.Xs} color="white" />}
          </>,
        ),
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
      })}
      eventHandlers={{
        click: () => {
          if (isMobile) setSelectedProposal(isSelected ? null : id)
          else
            dispatchEvent(VoteStepEvent.ClickProposal, {
              id,
            })
        },
      }}
    />
  )
})

export default VoteStepMapMarker
