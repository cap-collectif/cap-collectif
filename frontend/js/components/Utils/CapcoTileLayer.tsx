import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'maplibre-gl/dist/maplibre-gl.css'
import './leaflet-overrides.css'

const MAP_STYLE_URL = '/map-style.json'

const CapcoTileLayer = () => {
  const map = useMap()

  useEffect(() => {
    let glLayer: { remove: () => void } | null = null
    let hasUnmounted = false

    const mountLayer = async () => {
      // Load maplibre only when a map is rendered to avoid inflating commons.js.
      await import('@maplibre/maplibre-gl-leaflet')

      if (hasUnmounted || typeof L.maplibreGL !== 'function') {
        return
      }

      glLayer = L.maplibreGL({
        style: MAP_STYLE_URL,
      }).addTo(map)
    }

    void mountLayer()

    return () => {
      hasUnmounted = true
      glLayer?.remove()
    }
  }, [map])

  return null
}

export default CapcoTileLayer
