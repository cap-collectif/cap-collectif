// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { LeafletMap } from './LeafletMap';

describe('<LeafletMap />', () => {
  const defaultMapOptions = {
    center: { lat: 48.8586047, lng: 2.3137325 },
    zoom: 12,
  };

  const markers = {
    marker: {
      edges: [
        {
          node: {
            id: 'event1',
            googleMapsAddress: {
              lat: 47.12345789,
              lng: 1.23456789,
            },
          },
        },
        {
          node: {
            id: 'event2',
            googleMapsAddress: {
              lat: 47.1235444789,
              lng: 1.23477789,
            },
          },
        },
      ],
    },
  };

  const props = {
    dispatch: jest.fn(),
    eventSelected: 'event2',
    mapTokens: {
      MAPBOX: {
        initialPublicToken:
          '***REMOVED***',
        publicToken:
          '***REMOVED***',
        styleOwner: 'capcollectif',
        styleId: '***REMOVED***',
      },
    },
  };

  it('should render a map with markers', () => {
    const wrapper = shallow(
      <LeafletMap defaultMapOptions={defaultMapOptions} {...props} markers={markers} />,
    );
    wrapper.setState({ loaded: false });
    expect(wrapper).toMatchSnapshot();
  });
});
