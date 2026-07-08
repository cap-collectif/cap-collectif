import { isValidLatLng, parseLatLng, parseLatLngBounds } from './leaflet'

describe('leaflet utils', () => {
  describe('isValidLatLng', () => {
    it('accepts finite coordinates, including zero', () => {
      expect(isValidLatLng({ lat: 0, lng: 0 })).toBe(true)
      expect(isValidLatLng({ lat: 48.8586047, lng: 2.3137325 })).toBe(true)
    })

    it('rejects missing and non-finite coordinates', () => {
      expect(isValidLatLng(null)).toBe(false)
      expect(isValidLatLng({ lat: Number.NaN, lng: 2.3137325 })).toBe(false)
      expect(isValidLatLng({ lat: 48.8586047, lng: Number.POSITIVE_INFINITY })).toBe(false)
    })
  })

  describe('parseLatLng', () => {
    it('returns null when coordinates are not finite', () => {
      expect(parseLatLng('{"lat":null,"lng":2.3137325}')).toBe(null)
      expect(parseLatLng('{"lat":48.8586047,"lng":"2.3137325"}')).toBe(null)
    })
  })

  describe('parseLatLngBounds', () => {
    it('returns null when bounds contain invalid coordinates', () => {
      expect(parseLatLngBounds('{"topLeft":{"lat":null,"lng":2},"bottomRight":{"lat":1,"lng":3}}')).toBe(null)
    })
  })
})
