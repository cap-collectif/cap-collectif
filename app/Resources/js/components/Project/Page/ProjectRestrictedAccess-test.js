// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProjectRestrictedAccess } from './ProjectRestrictedAccess';

describe('<ProjectRestrictedAccess />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ProjectRestrictedAccess projectId="project1" icon="alpha" />);
    expect(wrapper).toMatchSnapshot();
  });
});
