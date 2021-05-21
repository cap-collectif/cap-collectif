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
    districts: {
      totalCount: 5,
      edges: [
        { node: { name: 'zone 1' } },
        { node: { name: 'zone 2' } },
        { node: { name: 'zone 3' } },
      ],
    },
    archived: false
  },
};

const propsArchived = {
  ...props,
  project: {
    ...props.project,
    archived: true
  }
}

const propsWithMoreDistricts = {
  breakingNumber: 3,
  fontSize: 16,
  project: {
    $refType,
    districts: {
      totalCount: 5,
      edges: [
        { node: { name: 'zone 1' } },
        { node: { name: 'zone 2' } },
        { node: { name: 'zone 3' } },
        { node: { name: 'zone 4' } },
        { node: { name: 'zone 5' } },
      ],
    },
    archived: false
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

  it('should render correctly when project is archived', () => {
    const wrapper = shallow(<ProjectHeaderDistrictsList {...propsArchived} />);
    wrapper.setState({ show: true });
    expect(wrapper).toMatchSnapshot();
  });
});
