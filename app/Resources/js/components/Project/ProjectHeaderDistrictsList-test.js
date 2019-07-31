// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { ProjectHeaderDistrictsList } from './ProjectHeaderDistrictsList';
import { $refType } from '../../mocks';

describe('<ProjectHeaderDistrictsList />', () => {
  const props = {
    project: {
      $refType,
      districts: [{ name: 'zone 1' }, { name: 'zone 2' }, { name: 'zone 3' }],
    },
  };

  const propsWithMoreDistricts = {
    project: {
      $refType,
      districts: [
        { name: 'zone 1' },
        { name: 'zone 2' },
        { name: 'zone 3' },
        { name: 'zone 4' },
        { name: 'zone 5' },
        { name: 'zone 6' },
        { name: 'zone 7' },
      ],
    },
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ProjectHeaderDistrictsList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with many districts', () => {
    const wrapper = shallow(<ProjectHeaderDistrictsList {...propsWithMoreDistricts} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with the display of modal', () => {
    const wrapper = shallow(<ProjectHeaderDistrictsList {...propsWithMoreDistricts} />);
    wrapper.setState({ show: true });
    expect(wrapper).toMatchSnapshot();
  });
});
