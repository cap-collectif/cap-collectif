/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { Status } from './Status';

describe('<Status />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<Status>My Status</Status>);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with other bgColor', () => {
    const wrapper = shallow(<Status>My Status</Status>);
    wrapper.setProps({ bgColor: 'danger' });
    expect(wrapper).toMatchSnapshot();
  });
});
