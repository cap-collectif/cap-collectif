import L from 'leaflet'
export type MapCenterObject = {
  readonly lat: number
  readonly lng: number
}
export type MapProps = {
  flyTo: (arg0: Array<number> | MapCenterObject, arg1: number | null | undefined) => void
  setView: (arg0: Array<number>, arg1: number | null | undefined) => void
  setZoom: (arg0: number | null | undefined) => void
  getZoom: () => number
  fitBounds: (arg0: Array<number | MapCenterObject>) => void
  locate: () => void
  zoomIn: () => void
  zoomOut: () => void
  panTo: (arg0: (Array<number> | null | undefined) | null) => void
  getPanes: () => {
    markerPane?: {
      children: Array<HTMLImageElement>
    }
  } | null
  getCenter: () => MapCenterObject
  getBounds: () => {
    readonly getNorthWest: () => MapCenterObject
    readonly getSouthEast: () => MapCenterObject
    readonly getSouthWest: () => MapCenterObject
    readonly getSouthEast: () => MapCenterObject
  }
  removeLayer: (arg0: typeof L.Marker) => void
  on: (
    arg0: string,
    arg1: (
      e?: (Event | null | undefined) & {
        latlng: MapCenterObject
      },
    ) => void | Promise<void>,
  ) => void | null
  invalidateSize: () => void
}
export type MapRef = {
  readonly current: null | MapProps
}
export type PopupProps = {
  setLatLng: (arg0: MapCenterObject) => PopupProps
  openOn: (arg0: null | MapProps) => void
  close: () => void
}
export type PopupRef = {
  readonly current: null | PopupProps
}
export type MapOptions = {
  center: MapCenterObject
  zoom: number
}
