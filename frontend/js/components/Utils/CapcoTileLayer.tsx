import React from 'react'
import { TileLayer } from 'react-leaflet'
import { getMapboxUrl } from '~/config'

const CapcoTileLayer = () => {
  return (
    <TileLayer
      attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/#/-74.5/40/10">Improve this map</a>'
      url={getMapboxUrl()}
    />
  )
}

export default CapcoTileLayer
