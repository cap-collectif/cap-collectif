import useMapTokens from '@hooks/useMapTokens'
import React from 'react'
import { TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'

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
      .filter(d => d.geojson && (d.displayedOnMap || getAllGeojsons))
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

export type MapToken = {
  readonly styleOwner: string | null
  readonly styleId: string | null
  readonly publicToken: string | null
} | null

export const getMapboxUrl = (mapTokens: MapToken) => {
  return mapTokens
    ? `https://api.mapbox.com/styles/v1/${mapTokens.styleOwner}/${mapTokens.styleId}/tiles/256/{z}/{x}/{y}?access_token=${mapTokens.publicToken}`
    : null
}

export const CapcoTileLayerLegacy = () => {
  const mapTokens = useMapTokens()
  return (
    <TileLayer
      // @ts-ignore
      attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/#/-74.5/40/10">Improve this map</a>'
      url={getMapboxUrl(mapTokens) || ''}
    />
  )
}

export const CapcoTileLayer = () => {
  const { mapToken } = useAppContext()
  return (
    <TileLayer
      // @ts-ignore
      attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/#/-74.5/40/10">Improve this map</a>'
      url={getMapboxUrl(mapToken) || ''}
    />
  )
}

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
