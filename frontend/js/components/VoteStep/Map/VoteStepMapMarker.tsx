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
  title: string
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
  title,
}: Props) {
  const isMobile = useIsMobile()

  const onActivate = () => {
    if (isMobile) setSelectedProposal(isSelected ? null : id)
    else
      dispatchEvent(VoteStepEvent.ClickProposal, {
        id,
      })
  }

  return (
    <Marker
      position={[lat, lng]}
      icon={L.divIcon({
        className: `preview-icn ${isActive ? 'active' : ''}`,
        html: renderToString(
          <>
            <Icon name={icon ? CapUIIcon.PinFull : CapUIIcon.Pin} size={CapUIIconSize.Sm} color={color} />
            {icon && <Icon name={convertIconToDs(icon)} size={CapUIIconSize.Xs} color="white" />}
            {/* Accessible name of the marker, which Leaflet exposes as a button */}
            <span className="sr-only">{title}</span>
          </>,
        ),
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
      })}
      eventHandlers={{
        click: onActivate,
        // Leaflet exposes markers as buttons but does not turn Enter or Space into a click
        keypress: (event: L.LeafletKeyboardEvent) => {
          if (event.originalEvent.key !== 'Enter' && event.originalEvent.key !== ' ') return
          event.originalEvent.preventDefault()
          onActivate()
        },
      }}
    />
  )
})

export default VoteStepMapMarker
