import React, { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import '@maplibre/maplibre-gl-leaflet'
import 'maplibre-gl/dist/maplibre-gl.css'

const MAP_STYLE_URL = '/map-style.json'

export type District = {
  id: string
  geojson: string
  border?: string
  background?: string
  displayedOnMap?: boolean
  titleOnMap?: string
  slug?: string
}

export type FormattedDistrict = {
  id: string
  geojson: string
  border: {
    color: string
    opacity: number
    size: number
  }
  background: {
    color: string
    opacity: number
    size: number
  }
  displayedOnMap: boolean
  titleOnMap?: string
  description?: string
  name: string
  cover?: { id: string }
}

export const convertToGeoJsonStyle = (style: FormattedDistrict) => {
  const defaultDistrictStyle = {
    color: '#ff0000',
    weight: 1,
    opacity: 0.3,
  }

  if (!style.border && !style.background) {
    return defaultDistrictStyle
  }

  const districtStyle: any = {}

  if (style.border) {
    districtStyle.color = style.border.color
    districtStyle.weight = style.border.size
    districtStyle.opacity = (style.border.opacity || 0) / 100
  }

  if (style.background) {
    districtStyle.fillColor = style.background.color
    districtStyle.fillOpacity = (style.background.opacity || 0) / 100
  }

  return districtStyle || defaultDistrictStyle
}

const parseGeoJson = (district: District) => {
  const { geojson, id } = district
  try {
    return JSON.parse(geojson || '')
  } catch (e) {
    console.error(false, `Using empty geojson for ${id} because we couldn't parse the geojson : ${geojson || ''}`)
    return null
  }
}

export const formatGeoJsons = (districts: ReadonlyArray<District>, getAllGeojsons: boolean = false) => {
  let geoJsons: any = []

  if (districts) {
    geoJsons = districts
      .filter(d => d && d.geojson && (d.displayedOnMap || getAllGeojsons))
      .map(d => ({
        district: parseGeoJson(d),
        style: {
          border: d.border,
          background: d.background,
        },
        titleOnMap: d.titleOnMap || undefined,
        id: d.id || undefined,
        slug: d.slug || undefined,
      }))
  }

  return geoJsons
}

const MapLibreTileLayer = () => {
  const map = useMap()

  useEffect(() => {
    const gl = L.maplibreGL({
      style: MAP_STYLE_URL,
    }).addTo(map)

    return () => {
      gl.remove()
    }
  }, [map])

  return null
}

export const CapcoTileLayerLegacy = () => <MapLibreTileLayer />
export const CapcoTileLayer = () => <MapLibreTileLayer />

export const parseLatLng = (latlng: string) => {
  try {
    const value = JSON.parse(latlng)
    return value
  } catch (e) {
    return null
  }
}

type Bounds = {
  readonly topLeft: {
    readonly lat: number
    readonly lng: number
  }
  readonly bottomRight: {
    readonly lat: number
    readonly lng: number
  }
}

export const boundsToLeaflet = (bounds: Bounds) => [bounds.topLeft, bounds.bottomRight]

export const parseLatLngBounds = (latlngBounds: string) => {
  try {
    const value = JSON.parse(latlngBounds)

    if (value.topLeft && value.bottomRight) {
      const bounds = L.latLngBounds(boundsToLeaflet(value))
      if (bounds.isValid()) return value
    }
    return null
  } catch (e) {
    return null
  }
}

export const exportLatLngBounds = (bounds: string) => {
  const parsedBounds = L.latLngBounds(JSON.parse(bounds))
  return {
    topLeft: parsedBounds.getNorthWest(),
    bottomRight: parsedBounds.getSouthEast(),
  }
}
