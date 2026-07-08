import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'maplibre-gl/dist/maplibre-gl.css'
import './leaflet-overrides.css'

const MAP_STYLE_URL = '/map-style.json'

type MaplibreLayer = L.Layer & {
  _glMap?: {
    _actualCanvas?: HTMLElement
    jumpTo: (options: { center: L.LatLng; zoom: number }) => void
    once: (event: string, handler: () => void) => void
    remove: () => void
  } | null
  _map?: L.Map | null
  _resizeContainer?: () => void
  _transitionEnd?: () => void
  _zoomEnd?: () => void
}

const isMapMounted = (map: L.Map | null | undefined) =>
  Boolean(map && (map as L.Map & { _mapPane?: HTMLElement })._mapPane)

export const createGuardedMaplibreLayer = (leaflet: typeof L, options: { style: string }): MaplibreLayer => {
  const layer = leaflet.maplibreGL(options) as unknown as MaplibreLayer

  const isLayerMounted = () => isMapMounted(layer._map) && Boolean(layer._glMap)

  layer._transitionEnd = function guardedTransitionEnd() {
    leaflet.Util.requestAnimFrame(() => {
      if (!isLayerMounted() || !layer._glMap?._actualCanvas) return

      const map = layer._map as L.Map
      const zoom = map.getZoom()
      const center = map.getCenter()
      const offset = map.latLngToContainerPoint(map.getBounds().getNorthWest())

      layer._resizeContainer?.()
      leaflet.DomUtil.setTransform(layer._glMap._actualCanvas, offset, 1)

      layer._glMap.once(
        'moveend',
        leaflet.Util.bind(() => {
          layer._zoomEnd?.()
        }, layer),
      )

      layer._glMap.jumpTo({
        center,
        zoom: zoom - 1,
      })
    }, layer)
  }

  return layer
}

const CapcoTileLayer = () => {
  const map = useMap()

  useEffect(() => {
    let glLayer: MaplibreLayer | null = null
    let hasUnmounted = false

    const mountLayer = async () => {
      // Load maplibre only when a map is rendered to avoid inflating commons.js.
      await import('@maplibre/maplibre-gl-leaflet')

      if (hasUnmounted || !isMapMounted(map) || typeof L.maplibreGL !== 'function') {
        return
      }

      glLayer = createGuardedMaplibreLayer(L, {
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
