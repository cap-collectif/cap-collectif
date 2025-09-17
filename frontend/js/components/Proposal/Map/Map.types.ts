import L from 'leaflet'
export type MapCenterObject = {
  readonly lat: number
  readonly lng: number
}
export type PopupRef = {
  readonly current: null | L.Popup
}
export type MapOptions = {
  center: MapCenterObject
  zoom: number
}
