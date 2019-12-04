// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import DistrictAdminFields from './DistrictAdminFields';

describe('<DistrictAdminFields />', () => {
  it('renders correcty', () => {
    const props = {
      district: {
        id: 'districtId',
        name: 'District',
        geojson: null,
        displayedOnMap: false,
        border: {
          enabled: true,
          color: '#AAAAAA',
          opacity: 0.2,
          size: 1,
        },
        background: {
          enabled: true,
          color: '#AAAAAA',
          opacity: 0.3,
        },
      },
      member: 'form',
      enableDesignFields: false
    };

    const wrapper = shallow(<DistrictAdminFields {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
