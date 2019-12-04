// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProjectTrash } from './ProjectTrash';

describe('<ProjectTrash />', () => {
  const props = {
    projectId: 'UHJvamVjdDpwcm9qZWN0MQ==',
    isAuthenticated: true,
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ProjectTrash {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
