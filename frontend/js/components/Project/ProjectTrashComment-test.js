// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProjectTrashComment } from './ProjectTrashComment';

describe('<ProjectTrashComment />', () => {
  const props = {
    projectId: 'UHJvamVjdDpwcm9qZWN0MQ==',
    isAuthenticated: true,
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ProjectTrashComment {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
