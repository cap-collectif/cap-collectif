// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProjectHeaderDistricts } from './ProjectHeaderDistricts';

describe('<ProjectHeaderDistricts />', () => {
  const props = {
    projectId: 'project1',
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ProjectHeaderDistricts {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
