// @flow
/* eslint-env jest */
import { isValid } from './GeoJsonValidator';

describe('GeoJsonValidator fails if not geojson', () => {
  it('json but absolutely not geojson', () => {
    expect(isValid({type: 'InvalidThing'})).toEqual(false);
  });
  it ('almost valid geojson', () => {
    const almostValidGeoJson = {
      type: 'FeatureCollection',
      features: [
        {type: 'Feature', geometry: {type: 'Point', coordinates: [102.0, 0.5, 0.1]}}
      ]
    };
    expect(isValid(almostValidGeoJson)).toEqual(false);
  });
});

describe('GeoJSonValidator success', () => {
  it ('FeatureCollection', () => {
    const validGeoJson = {
      type: 'FeatureCollection',
      features: [
        {type: 'Feature', geometry: {type: 'Point', coordinates: [102.0, 0.5]}},
        {type: 'Feature', geometry: {type: 'LineString', coordinates: [[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]]}},
        {type: 'Feature', geometry: {type: 'Polygon', coordinates: [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],[100.0, 1.0], [100.0, 0.0]]]}}
      ]
    };
    expect(isValid(validGeoJson)).toEqual(true);
  });
});
