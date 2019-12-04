// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import ProjectStepAdmin from './ProjectStepAdmin';

describe('<ProjectStepAdmin />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ProjectStepAdmin form="testForm" />);
    expect(wrapper).toMatchSnapshot();
  });
});
