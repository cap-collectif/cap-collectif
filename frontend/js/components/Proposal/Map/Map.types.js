// @flow
import L from 'leaflet';

export type MapCenterObject = {|
  +lat: number,
  +lng: number,
|};

export type MapProps = {
  flyTo: (Array<number> | MapCenterObject, ?number) => void,
  setView: (Array<number>, ?number) => void,
  setZoom: (?number) => void,
  locate: () => void,
  zoomIn: () => void,
  zoomOut: () => void,
  panTo: (?Array<number> | null) => void,
  getPanes: () => { markerPane?: { children: Array<HTMLImageElement> } } | null,
  getCenter: () => MapCenterObject,
  removeLayer: (typeof L.Marker) => void,
  on: (string, (e?: { ...?Event, latlng: MapCenterObject }) => void | Promise<void>) => void | null,
  invalidateSize: () => void,
};
export type MapRef = {|
  +current: null | MapProps,
|};

export type PopupProps = {
  setLatLng: MapCenterObject => PopupProps,
  openOn: (null | MapProps) => void,
  close: () => void,
};
export type PopupRef = {|
  +current: null | PopupProps,
|};

export type MapOptions = {|
  center: MapCenterObject,
  zoom: number,
|};
