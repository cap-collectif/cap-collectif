import * as React from 'react'
import L from 'leaflet'
import { MapContainer } from 'react-leaflet'
import union from 'turf-union'
import turf from 'turf-meta'
import 'leaflet/dist/leaflet.css'
import CapcoTileLayer from '../Utils/CapcoTileLayer'
import { formatGeoJsons } from '~/utils/geojson'
import AppBox from '../Ui/Primitives/AppBox'

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
    ]
    L.Polygon.prototype.initialize.call(this, [outerBoundsLatLngs, latLngs], options)
  },
})

L.mask = function (latLngs, options) {
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
  const mapRef = React.useRef(null)
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
  if (!geoJSON.length || !geoJSON[0].district) return null
  const districtGeoJSON = getDistrict(geoJSON)
  if (!districtGeoJSON) return null
  return (
    <AppBox
      width="575px"
      height="300px"
      borderRadius={20}
      overflow="hidden"
      boxShadow="medium"
      marginTop="-80px"
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
        whenCreated={map => {
          mapRef.current = map
          const latLngs = []
          // Cannot precisely type a GeoJSON object
          const hull: any = unionizeFeatureEach(geoJSON[0].district)

          if (hull.geometry.type === 'MultiPolygon') {
            hull.geometry.coordinates.forEach(coordinate => {
              coordinate[0].forEach(point => latLngs.push(new L.LatLng(point[1], point[0])))
            })
          } else {
            for (let i = 0; i < (hull.geometry.coordinates[0].length || 0); i++) {
              latLngs.push(new L.LatLng(hull.geometry.coordinates[0][i][1], hull.geometry.coordinates[0][i][0]))
            }
          }

          map.fitBounds(districtGeoJSON.getBounds())
          L.mask(latLngs).addTo(map)
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
        zoom="13"
        zoomControl={false}
        dragging={false}
        tap={false}
        center={[0, 0]}
        doubleClickZoom={false}
        touchZoom={false}
        trackResize={false}
        scrollWheelZoom={false}
      >
        <CapcoTileLayer />
      </MapContainer>
    </AppBox>
  )
}

export default DistrictPageMap
