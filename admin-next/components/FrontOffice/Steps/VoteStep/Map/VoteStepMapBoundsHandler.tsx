import { FC, useEffect, useRef } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { useQueryState } from 'nuqs'
import type { LatLngBounds } from 'leaflet'

type Props = {
  markers: Array<{ address?: { lat?: number; lng?: number } | null }>
}

const VoteStepMapBoundsHandler: FC<Props> = ({ markers }) => {
  const map = useMap()
  const [latlngBounds, setLatlngBounds] = useQueryState('latlngBounds')
  const isInitialFitBounds = useRef(false)
  const hasUserInteracted = useRef(false)
  const isProgrammaticMove = useRef(false)

  // Initial fit bounds to show all markers in bounds
  useEffect(() => {
    if (!latlngBounds && markers.length > 0 && !isInitialFitBounds.current) {
      const validMarkers = markers.filter(m => m.address?.lat && m.address?.lng)
      if (validMarkers.length > 0) {
        const bounds = validMarkers.map(m => [m.address!.lat!, m.address!.lng!] as [number, number])
        isProgrammaticMove.current = true
        map.fitBounds(bounds, { padding: [50, 50] })
        isInitialFitBounds.current = true
      }
    }
  }, [markers, map, latlngBounds])

  // Detect map bounds changes and update URL (only after user interaction)
  useMapEvents({
    zoomstart: () => {
      hasUserInteracted.current = true
    },
    dragstart: () => {
      hasUserInteracted.current = true
    },
    moveend: () => {
      // Only update if user has interacted with the map
      if (hasUserInteracted.current && !isProgrammaticMove.current) {
        const bounds: LatLngBounds = map.getBounds()
        const ne = bounds.getNorthEast()
        const sw = bounds.getSouthWest()

        const latlngBoundsValue = JSON.stringify([
          { lat: ne.lat, lng: sw.lng },
          { lat: sw.lat, lng: ne.lng },
        ])

        setLatlngBounds(latlngBoundsValue)
        isProgrammaticMove.current = false
      }
    },
  })

  return null
}

export default VoteStepMapBoundsHandler
