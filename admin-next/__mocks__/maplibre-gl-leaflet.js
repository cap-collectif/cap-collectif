const L = require('leaflet')

if (!L.maplibreGL) {
  L.maplibreGL = () => ({
    addTo: () => ({
      remove: () => {},
    }),
  })
}

module.exports = {}
