import L from 'leaflet'
import { createGuardedMaplibreLayer } from './CapcoTileLayer'

describe('createGuardedMaplibreLayer', () => {
  const originalMaplibreGL = L.maplibreGL
  const originalRequestAnimFrame = L.Util.requestAnimFrame

  afterEach(() => {
    L.maplibreGL = originalMaplibreGL
    L.Util.requestAnimFrame = originalRequestAnimFrame
    jest.clearAllMocks()
  })

  it('does not read bounds after Leaflet has unmounted the map pane', () => {
    let scheduledFrame: ((timestamp: number) => void) | null = null
    const getBounds = jest.fn()
    const fakeLayer: any = {
      _glMap: {
        _actualCanvas: document.createElement('canvas'),
        jumpTo: jest.fn(),
        once: jest.fn(),
      },
      _map: {
        _mapPane: document.createElement('div'),
        getBounds,
        getCenter: jest.fn(),
        getZoom: jest.fn(),
        latLngToContainerPoint: jest.fn(),
      },
    }

    L.maplibreGL = jest.fn(() => fakeLayer)
    L.Util.requestAnimFrame = jest.fn(callback => {
      scheduledFrame = callback
      return 1
    })

    const layer = createGuardedMaplibreLayer(L, { style: '/map-style.json' })
    layer._transitionEnd?.()
    fakeLayer._map._mapPane = undefined
    scheduledFrame?.(0)

    expect(getBounds).not.toHaveBeenCalled()
    expect(fakeLayer._glMap.jumpTo).not.toHaveBeenCalled()
  })

  it('keeps the MapLibre transition sync when the Leaflet map is still mounted', () => {
    let scheduledFrame: ((timestamp: number) => void) | null = null
    const center = L.latLng(48.8586, 2.3137)
    const northWest = L.latLng(49, 2)
    const offset = L.point(12, 24)
    const fakeLayer: any = {
      _glMap: {
        _actualCanvas: document.createElement('canvas'),
        jumpTo: jest.fn(),
        once: jest.fn(),
      },
      _map: {
        _mapPane: document.createElement('div'),
        getBounds: jest.fn(() => ({ getNorthWest: () => northWest })),
        getCenter: jest.fn(() => center),
        getZoom: jest.fn(() => 16),
        latLngToContainerPoint: jest.fn(() => offset),
      },
      _resizeContainer: jest.fn(),
      _zoomEnd: jest.fn(),
    }
    jest.spyOn(L.DomUtil, 'setTransform').mockImplementation(jest.fn())

    L.maplibreGL = jest.fn(() => fakeLayer)
    L.Util.requestAnimFrame = jest.fn(callback => {
      scheduledFrame = callback
      return 1
    })

    const layer = createGuardedMaplibreLayer(L, { style: '/map-style.json' })
    layer._transitionEnd?.()
    scheduledFrame?.(0)

    expect(fakeLayer._map.getBounds).toHaveBeenCalledTimes(1)
    expect(fakeLayer._resizeContainer).toHaveBeenCalledTimes(1)
    expect(fakeLayer._glMap.once).toHaveBeenCalledWith('moveend', expect.any(Function))
    expect(fakeLayer._glMap.jumpTo).toHaveBeenCalledWith({
      center,
      zoom: 15,
    })
  })
})
