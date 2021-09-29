// @flow
import { Emitter } from '~/config';
import { type MapCenterObject } from './Map.types';

export const MapEvents: {
  ToastShowOnMap: 'toast-on-map',
  OpenPopupOnMap: 'open-popup-on-map',
} = {
  ToastShowOnMap: 'toast-on-map',
  OpenPopupOnMap: 'open-popup-on-map',
};

export const mapToast = (): void => {
  Emitter.emit(MapEvents.ToastShowOnMap);
};

export const mapOpenPopup = (addr: MapCenterObject): void => {
  Emitter.emit(MapEvents.OpenPopupOnMap, addr);
};
