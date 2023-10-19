import GeoJsonGeometriesLookup from 'geojson-geometries-lookup'
import warning from '~/utils/warning'
import type { MapCenterObject } from '~/components/Proposal/Map/Map.types'
export type Style = {
  readonly border?:
    | {
        readonly id: string | null | undefined
        readonly enabled: boolean
        readonly color: string | null | undefined
        readonly opacity: number | null | undefined
        readonly size: number | null | undefined
      }
    | null
    | undefined
  readonly background?:
    | {
        readonly id: string | null | undefined
        readonly enabled: boolean
        readonly color: string | null | undefined
        readonly opacity: number | null | undefined
        readonly size: number | null | undefined
      }
    | null
    | undefined
}
export const convertToGeoJsonStyle = (style: Style) => {
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
export type GeoJson = {
  district: string
  style: Style
  titleOnMap?: string | null | undefined
  id?: string
  slug?: string | null | undefined
}
export const geoContains = (geoJSONS: Array<GeoJson>, pos: MapCenterObject) => {
  if (!pos || !geoJSONS.length) return false
  return geoJSONS.some(geoJSON => {
    const glookup = new GeoJsonGeometriesLookup(geoJSON.district)
    const point = {
      type: 'Point',
      coordinates: [pos.lng, pos.lat],
    }
    return glookup.hasContainers(point)
  })
}
type District = {
  readonly geojson: string | null | undefined
  readonly id: string
  readonly slug?: string | null | undefined
  readonly displayedOnMap: boolean
  readonly name?: string
  readonly titleOnMap?: string
  readonly border?:
    | {
        readonly id: string | null | undefined
        readonly enabled: boolean
        readonly color: string | null | undefined
        readonly opacity: number | null | undefined
        readonly size: number | null | undefined
      }
    | null
    | undefined
  readonly background?:
    | {
        readonly id: string | null | undefined
        readonly enabled: boolean
        readonly color: string | null | undefined
        readonly opacity: number | null | undefined
        readonly size: number | null | undefined
      }
    | null
    | undefined
}

const parseGeoJson = (district: District) => {
  const { geojson, id } = district

  try {
    return JSON.parse(geojson || '')
  } catch (e) {
    warning(false, `Using empty geojson for ${id} because we couldn't parse the geojson : ${geojson || ''}`)
    return null
  }
}

export const formatGeoJsons = (districts: ReadonlyArray<District>, getAllGeojsons: boolean = false) => {
  let geoJsons: any = []

  if (districts) {
    geoJsons = districts
      .filter(d => d.geojson && (d.displayedOnMap || getAllGeojsons))
      .map<GeoJson>(d => ({
        district: parseGeoJson(d),
        style: {
          border: d.border,
          background: d.background,
        },
        titleOnMap: d.titleOnMap || undefined,
        id: d.id,
        slug: d.slug,
      }))
  }

  return geoJsons
}
