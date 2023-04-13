// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { MapContainer } from 'react-leaflet';
import LocateAndZoomControl from './LocateAndZoomControl';
import MockProviders from '~/testUtils';

describe('<LocateAndZoomControl />', () => {
  it('should render correctly', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <MapContainer>
          <LocateAndZoomControl />
        </MapContainer>
      </MockProviders>,
    );
    expect(testComponentTree).toMatchSnapshot();
  });
});
