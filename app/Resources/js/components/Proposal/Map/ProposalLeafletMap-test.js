// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalLeafletMap } from './ProposalLeafletMap';
import { $fragmentRefs, $refType } from '../../../mocks';

describe('<ProposalLeafletMap />', () => {
  const defaultMapOptions = {
    center: { lat: 48.8586047, lng: 2.3137325 },
    zoom: 12,
  };

  const proposals = [
    {
      $refType,
      address: {
        lat: 49.8397,
        lng: 24.0297,
      },
      url: 'http://test',
      title: 'test',
      publishedAt: '2017-02-01 00:04:00',
      author: { $fragmentRefs },
      media: { url: 'media.jpg' },
    },
    {
      $refType,
      address: {
        lat: 52.2297,
        lng: 21.0122,
      },
      url: 'http://test',
      title: 'test',
      publishedAt: '2016-02-03 00:01:00',
      author: { $fragmentRefs },
      media: { url: 'media.jpg' },
    },
    {
      $refType,
      url: 'http://invalid',
      address: null,
      title: 'invalidOne',
      publishedAt: '2001-01-001 01:01:01',
      author: { $fragmentRefs },
      media: { url: 'media.jpg' },
    },
    {
      $refType,
      address: {
        lat: 51.5074,
        lng: -0.0901,
      },
      url: 'http://test',
      title: 'test',
      publishedAt: '2010-06-07 01:02:50',
      author: { $fragmentRefs },
      media: { url: 'media.jpg' },
    },
  ];

  const mapTokens = {
    MAPBOX: {
      initialPublicToken:
        '***REMOVED***',
      publicToken:
        '***REMOVED***',
      styleOwner: 'capcollectif',
      styleId: '***REMOVED***',
    },
  };

  it('should render a map with only valid markers', () => {
    const wrapper = shallow(
      <ProposalLeafletMap
        defaultMapOptions={defaultMapOptions}
        visible
        mapTokens={mapTokens}
        proposals={proposals}
      />,
    );
    const popup = wrapper.find('ProposalLeafletMap__BlankPopup');
    expect(popup).toHaveLength(3);
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render a map with visible = false', () => {
    const wrapper = shallow(
      <ProposalLeafletMap
        defaultMapOptions={defaultMapOptions}
        visible={false}
        mapTokens={mapTokens}
        proposals={proposals}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
