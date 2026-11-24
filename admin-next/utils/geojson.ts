import type { GeoJsonObject } from 'geojson'
import GeoJsonGeometriesLookup from 'geojson-geometries-lookup'

type DistrictStyle = {
  color: string | null
  opacity: number | null
  size: number | null
}

export type District = {
  id: string
  geojson: string | null
  border?: DistrictStyle | null
  background?: DistrictStyle | null
  displayedOnMap?: boolean
  titleOnMap?: string
  slug?: string
}

export const formatGeoJsons = (districts: readonly District[], includeHidden = false) =>
  districts.flatMap(({ id, geojson, border, background, displayedOnMap, titleOnMap, slug }) => {
    if (!geojson || (!displayedOnMap && !includeHidden)) return []

    try {
      const district: GeoJsonObject | null = JSON.parse(geojson)
      return district ? [{ district, style: { border, background }, titleOnMap, id, slug }] : []
    } catch {
      console.error(`Could not parse GeoJSON for district ${id}`)
      return []
    }
  })

export const findDistrictAt = (districts: readonly District[], location?: { lat: number; lng: number } | null) => {
  if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) return undefined

  return formatGeoJsons(districts, true).find(({ district }) =>
    new GeoJsonGeometriesLookup(district, { ignorePoints: true, ignoreLines: true }).hasContainers({
      type: 'Point',
      coordinates: [location.lng, location.lat],
    }),
  )?.id
}
