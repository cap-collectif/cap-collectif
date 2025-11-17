'use client'

import * as React from 'react'
// @ts-ignore TODO : updates and type leaflet
import L from 'leaflet'
import { MapContainer } from 'react-leaflet'
import union from 'turf-union'
import turf from 'turf-meta'
import 'leaflet/dist/leaflet.css'
import { Box } from '@cap-collectif/ui'
import { CapcoTileLayer, formatGeoJsons } from '@utils/leaflet'
import { pxToRem } from '@shared/utils/pxToRem'

type Props = {
  geojson: string
}
export const getDistrict = (geoJSON: any[]) => {
  try {
    return L.geoJson(geoJSON[0].district)
  } catch (e) {
    return null
  }
}
// @ts-ignore TODO : updates and type leaflet
L.Mask = L.Polygon.extend({
  options: {
    stroke: false,
    color: 'white',
    fillOpacity: 0.7,
    outerBounds: new L.LatLngBounds([-90, -360], [90, 360]),
  },

  initialize(latLngs, options) {
    const outerBoundsLatLngs = [
      this.options.outerBounds.getSouthWest(),
      this.options.outerBounds.getNorthWest(),
      this.options.outerBounds.getNorthEast(),
      this.options.outerBounds.getSouthEast(),
    ] // @ts-ignore TODO : updates and type leaflet
    L.Polygon.prototype.initialize.call(this, [outerBoundsLatLngs, latLngs], options)
  },
})
// @ts-ignore TODO : updates and type leaflet
L.mask = function (latLngs, options) {
  // @ts-ignore TODO : updates and type leaflet
  return new L.Mask(latLngs, options)
}

// Cannot precisely type a GeoJSON object
const unionizeFeatureEach = (polygons: any) => {
  if (!polygons.features || polygons.features.length === 0) {
    return polygons
  }

  let ret = polygons.features[0]
  turf.featureEach(polygons, currentFeature => {
    if (currentFeature.geometry.type !== 'MultiPolygon') ret = union(ret, currentFeature)
  })
  return ret
}

const DistrictPageMap = ({ geojson }: Props) => {
  const [mapRef, setMapRef] = React.useState<L.Map | null>(null)
  const geoJSON = formatGeoJsons(
    [
      {
        geojson,
        displayedOnMap: true,
        id: '',
      },
    ],
    true,
  )
  const districtGeoJSON = getDistrict(geoJSON)

  React.useEffect(() => {
    if (mapRef) {
      const latLngs = []
      // Cannot precisely type a GeoJSON object
      const hull: any = unionizeFeatureEach(geoJSON[0].district)

      if (hull.geometry?.type === 'MultiPolygon') {
        hull.geometry?.coordinates.forEach(coordinate => {
          coordinate[0].forEach(point => latLngs.push(new L.LatLng(point[1], point[0])))
        })
      } else {
        for (let i = 0; i < (hull.geometry?.coordinates[0].length || 0); i++) {
          latLngs.push(new L.LatLng(hull.geometry?.coordinates[0][i][1], hull.geometry?.coordinates[0][i][0]))
        }
      }

      mapRef.fitBounds(districtGeoJSON.getBounds())
      // @ts-ignore TODO : updates and type leaflet
      L.mask(latLngs).addTo(mapRef)
      mapRef.invalidateSize()
    }
  }, [districtGeoJSON, geoJSON, mapRef])

  if (!geoJSON.length || !geoJSON[0].district) return null
  if (!districtGeoJSON) return null
  return (
    <Box
      width={pxToRem(575)}
      height={pxToRem(300)}
      borderRadius={20}
      overflow="hidden"
      boxShadow="medium"
      marginTop={`-${pxToRem(80)}`}
      css={{
        '.leaflet-control-container': {
          display: 'none !important',
        },
        path: {
          cursor: 'default',
        },
      }}
    >
      <MapContainer
        whenReady={() => {}}
        style={{
          width: '100%',
          height: '100%',
        }}
        zoom={13}
        zoomControl={false}
        dragging={false}
        center={[0, 0]}
        doubleClickZoom={false}
        touchZoom={false}
        trackResize={false}
        scrollWheelZoom={false}
        ref={setMapRef}
      >
        <CapcoTileLayer />
      </MapContainer>
    </Box>
  )
}

export default DistrictPageMap
