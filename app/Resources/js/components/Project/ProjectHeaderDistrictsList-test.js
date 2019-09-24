// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { ProjectHeaderDistrictsList } from './ProjectHeaderDistrictsList';
import { $refType } from '../../mocks';

const props = {
  breakingNumber: 3,
  fontSize: 16,
  project: {
    $refType,
    projectDistrictPositioner: {
      totalCount: 5,
      edges: [
        { node: { position: 3, district: { name: 'zone 1' } } },
        { node: { position: 2, district: { name: 'zone 2' } } },
        { node: { position: 1, district: { name: 'zone 3' } } },
      ],
    },
  },
};

const propsWithMoreDistricts = {
  breakingNumber: 3,
  fontSize: 16,
  project: {
    $refType,
    projectDistrictPositioner: {
      totalCount: 5,
      edges: [
        { node: { position: 3, district: { name: 'zone 1' } } },
        { node: { position: 2, district: { name: 'zone 2' } } },
        { node: { position: 1, district: { name: 'zone 3' } } },
        { node: { position: 4, district: { name: 'zone 4' } } },
        { node: { position: 5, district: { name: 'zone 5' } } },
      ],
    },
  },
};

describe('<ProjectHeaderDistrictsList />', () => {
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
