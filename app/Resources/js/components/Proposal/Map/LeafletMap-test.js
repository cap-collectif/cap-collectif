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

  const step = {
    dispatch: jest.fn(),
    stepId: 'step1',
    stepType: 'collect',
    mapTokens: {
      mapbox: {
        publicToken:
          '***REMOVED***',
        styleOwner: 'capcollectif',
        styleId: '***REMOVED***',
      },
    },
  };

  const markers = {
    markers: [
      {
        lat: 49.8397,
        lng: 24.0297,
        url: 'http://test',
        title: 'test',
        author: { username: 'test', url: 'http://test' },
      },
      {
        lat: 52.2297,
        lng: 21.0122,
        url: 'http://test',
        title: 'test',
        author: { username: 'test', url: 'http://test' },
      },
      {
        lat: 51.5074,
        lng: -0.0901,
        url: 'http://test',
        title: 'test',
        author: { username: 'test', url: 'http://test' },
      },
    ],
  };

  it('should render a map with markers', () => {
    const wrapper = shallow(
      <LeafletMap defaultMapOptions={defaultMapOptions} visible {...step} markers={markers} />,
    );
    wrapper.setState({ loaded: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render a map with visible = false', () => {
    const wrapper = shallow(
      <LeafletMap
        defaultMapOptions={defaultMapOptions}
        visible={false}
        markers={markers}
        {...step}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
