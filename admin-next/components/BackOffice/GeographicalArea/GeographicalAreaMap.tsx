import * as React from 'react'
import L from 'leaflet'
import { MapContainer, GeoJSON, Rectangle, Tooltip } from 'react-leaflet'
import { Box, CapUIFontFamily } from '@cap-collectif/ui'
import { CapcoTileLayerLegacy, District, formatGeoJsons } from '@utils/leaflet'
import 'leaflet/dist/leaflet.css'
import { convertToGeoJsonStyle } from '@utils/leaflet'

type Props = { district: District }

export const getDistrict = (geoJSON: any[]) => {
  try {
    return L.geoJson(geoJSON[0].district)
  } catch (e) {
    return null
  }
}

const GeographicalAreaMap: React.FC<Props> = ({ district }) => {
  const [mapRef, setMapRef] = React.useState(null)
  const geoJsonLayerRef = React.useRef(null)

  const geoJSON = formatGeoJsons([district])
  const districtGeoJSON = getDistrict(geoJSON)
  const isValidGeoJSON = district.geojson && geoJSON.length && geoJSON[0].district && districtGeoJSON

  React.useEffect(() => {
    if (mapRef && geoJsonLayerRef.current && isValidGeoJSON) {
      mapRef.invalidateSize()
      mapRef.fitBounds(districtGeoJSON.getBounds())
      geoJsonLayerRef?.current?.clearLayers()?.addData(geoJSON[0].district)
    }
  }, [isValidGeoJSON, districtGeoJSON, geoJSON, mapRef])

  return (
    <Box
      width="50%"
      display={isValidGeoJSON ? 'block' : 'none'}
      sx={{
        '.leaflet-interactive': {
          strokeDasharray: 10,
        },
        '.titleTooltip': {
          opacity: '1 !important',
          fontFamily: CapUIFontFamily.Label,
          fontSize: '14px',
          fontWeight: 600,
          marginLeft: '50%',
          position: 'relative',
          width: '100%',
          '::before': { display: 'none' },
        },
      }}
    >
      <MapContainer
        style={{
          width: '100%',
          height: '100%',
        }}
        // @ts-ignore https://github.com/cap-collectif/platform/issues/15975
        zoom="13"
        zoomControl={false}
        dragging={false}
        tap={false}
        center={[0, 0]}
        doubleClickZoom={false}
        touchZoom={false}
        trackResize={false}
        scrollWheelZoom={false}
        ref={setMapRef}
      >
        <CapcoTileLayerLegacy />
        {isValidGeoJSON ? (
          <GeoJSON
            // @ts-ignore https://github.com/cap-collectif/platform/issues/15975
            style={convertToGeoJsonStyle(geoJSON[0].style)}
            data={geoJSON[0].district}
            ref={geoJsonLayerRef}
          />
        ) : null}
        {district.titleOnMap && isValidGeoJSON ? (
          <Rectangle bounds={districtGeoJSON.getBounds()} pathOptions={{ color: 'transparent' }}>
            {/** @ts-ignore https://github.com/cap-collectif/platform/issues/15975 */}
            <Tooltip permanent className="titleTooltip">
              {district.titleOnMap}
            </Tooltip>
          </Rectangle>
        ) : null}
      </MapContainer>
    </Box>
  )
}

export default GeographicalAreaMap
