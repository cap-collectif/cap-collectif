// @flow
import { createControlComponent } from '@react-leaflet/core';
import { Control } from 'leaflet';

export default createControlComponent((props: {| +position?: string |}) => new Control.Zoom(props));
