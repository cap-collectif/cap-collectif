/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import MapboxAdminConfig from './MapboxAdminConfig';
import { formMock } from '../../../mocks';

describe('<MapboxAdminConfig/>', () => {
  it('should render', () => {
    const props = {
      ...formMock,
      mapToken: {
        id: 'mapboxMapToken',
        publicToken: 'publicToken',
        secretToken: 'secretToken',
        provider: 'MAPBOX',
        styleOwner: null,
        styleId: null,
        styles: [],
      },
    };
    const wrapper = shallow(<MapboxAdminConfig {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render with styles', () => {
    const props = {
      ...formMock,
      mapToken: {
        id: 'mapboxMapToken',
        publicToken: 'publicToken',
        secretToken: 'secretToken',
        provider: 'MAPBOX',
        styleOwner: 'capcollectif',
        styleId: 'lebotheme',
        styles: [
          {
            id: 'mapStyle1',
            owner: 'capcollectif',
            name: 'Le bo thème',
            previewUrl:
              'https://api.mapbox.com/styles/v1/capcollectif/lebotheme/tiles/256/14/8114/5686?access_token=***REMOVED***',
            createdAt: '2018-11-23 00:00:00',
            updatedAt: null,
            isCurrent: true,
          },
          {
            id: 'mapStyle2',
            owner: 'capcollectif',
            name: 'Le bo thème 2',
            previewUrl:
              'https://api.mapbox.com/styles/v1/capcollectif/lebotheme2/tiles/256/14/8114/5686?access_token=***REMOVED***',
            createdAt: '2018-11-23 00:00:00',
            updatedAt: '2018-11-23 10:00:00',
            isCurrent: false,
          },
        ],
      },
    };
    const wrapper = shallow(<MapboxAdminConfig {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
