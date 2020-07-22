// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DistrictAdminFields } from './DistrictAdminFields';
import { $refType } from '~/mocks';

const baseProps = {
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
  isDisplayedOnMap: true,
  dispatch: jest.fn(),
};

const props = {
  basic: baseProps,
  notDisplayOnMap: {
    ...baseProps,
    isDisplayedOnMap: false,
  },
};

describe('<DistrictAdminFields />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<DistrictAdminFields {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when not display on map', () => {
    const wrapper = shallow(<DistrictAdminFields {...props.notDisplayOnMap} />);
    expect(wrapper).toMatchSnapshot();
  });
});
