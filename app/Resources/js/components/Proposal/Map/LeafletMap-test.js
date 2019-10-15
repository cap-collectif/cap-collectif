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

  const markers = [
    {
      lat: 49.8397,
      lng: 24.0297,
      url: 'http://test',
      title: 'test',
      author: { username: 'test', url: 'http://test', media: { url: 'media.png' } },
      media: 'media.jpg',
      date: '18 aout 98',
    },
    {
      lat: 52.2297,
      lng: 21.0122,
      url: 'http://test',
      title: 'test',
      author: { username: 'test', url: 'http://test', media: { url: 'media.png' } },
      media: 'media.jpg',
      date: '18 aout 98',
    },
    {
      lat: 51.5074,
      lng: -0.0901,
      url: 'http://test',
      title: 'test',
      author: { username: 'test', url: 'http://test', media: { url: 'media.png' } },
      media: 'media.jpg',
      date: '18 aout 98',
    },
  ];

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
