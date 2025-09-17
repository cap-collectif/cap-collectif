import * as React from 'react'
import L from 'leaflet'
import { GeoJSON, Tooltip, Rectangle, useMap } from 'react-leaflet'
import { convertToGeoJsonStyle } from '~/utils/geojson'

const getDistrict = (geoJSON: any) => {
  try {
    return L.geoJson(geoJSON.district)
  } catch (e) {
    return null
  }
}

export const GeoJSONView = ({ geoJson, zoom, displayPopup }: { geoJson: any; zoom: number; displayPopup: boolean }) => {
  const map = useMap()
  const geoJsonRef = React.useRef(null)
  const tooltipRef = React.useRef(null)

  const closeTooltip = () => {
    if (tooltipRef?.current && !displayPopup) tooltipRef.current.close()
  }

  const openTooltip = () => {
    if (tooltipRef?.current && map) tooltipRef.current.openOn(map)
  }

  const districtGeoJSON = getDistrict(geoJson)
  React.useEffect(() => {
    if (!displayPopup) closeTooltip()
    else openTooltip() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayPopup])
  return (
    <>
      <GeoJSON
        style={convertToGeoJsonStyle(geoJson.style)}
        key={`${geoJson.id}-${zoom}`}
        data={geoJson.district}
        onEachFeature={(feature, layer) => {
          layer.on('mouseover', () => openTooltip())
          layer.on('mouseout', e => {
            if (e.originalEvent.toElement.nodeName !== 'A') {
              closeTooltip()
            }
          })
        }}
      />
      {geoJson.titleOnMap ? (
        <Rectangle
          bounds={districtGeoJSON?.getBounds()}
          pathOptions={{
            color: 'transparent',
          }}
          className="rect"
          ref={geoJsonRef}
        >
          <Tooltip interactive permanent className="titleTooltip" ref={tooltipRef}>
            <a
              href={`/project-district/${geoJson.slug || ''}`}
              style={{
                color: 'black',
                textDecoration: 'none',
              }}
            >
              {geoJson.titleOnMap}
            </a>
          </Tooltip>
        </Rectangle>
      ) : null}
    </>
  )
}
export default GeoJSONView
