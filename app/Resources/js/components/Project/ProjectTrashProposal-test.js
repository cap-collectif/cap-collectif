// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProjectTrashProposal } from './ProjectTrashProposal';

describe('<ProjectTrashProposal />', () => {
  const props = {
    projectId: 'UHJvamVjdDpwcm9qZWN0MQ==',
    isAuthenticated: true,
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ProjectTrashProposal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
