// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DistrictAdminFields } from './DistrictAdminFields';
import { $refType } from '~/mocks';

describe('<DistrictAdminFields />', () => {
  it('renders correctly', () => {
    const props = {
      district: {
        $refType,
        border: {
          enabled: true,
        },
        background: {
          enabled: true,
        },
      },
      member: 'form',
      enableDesignFields: false,
    };

    const wrapper = shallow(<DistrictAdminFields {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
