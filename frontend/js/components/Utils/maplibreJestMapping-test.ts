/* eslint-env jest */

describe('maplibre Jest mapping', () => {
  it('uses anchored patterns and keeps plugin mapping first', () => {
    const { moduleNameMapper } = require('../../../../jest.config')
    const keys = Object.keys(moduleNameMapper)

    expect(moduleNameMapper['^@maplibre/maplibre-gl-leaflet$']).toBe('<rootDir>/__mocks__/maplibre-gl-leaflet.js')
    expect(moduleNameMapper['^maplibre-gl$']).toBe('<rootDir>/__mocks__/maplibre-gl.js')
    expect(moduleNameMapper['@maplibre/maplibre-gl-leaflet']).toBeUndefined()
    expect(moduleNameMapper['maplibre-gl']).toBeUndefined()
    expect(keys.indexOf('^@maplibre/maplibre-gl-leaflet$')).toBeLessThan(keys.indexOf('^maplibre-gl$'))
  })

  it('loads plugin side effect when importing @maplibre/maplibre-gl-leaflet', () => {
    jest.resetModules()
    const L = require('leaflet')
    const previousMaplibreGL = L.maplibreGL

    L.maplibreGL = undefined
    require('@maplibre/maplibre-gl-leaflet')

    expect(typeof L.maplibreGL).toBe('function')
    L.maplibreGL = previousMaplibreGL
  })
})
