/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { Title } from './Title';

describe('<Title />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<Title>My title</Title>);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with other tagName', () => {
    const wrapper = shallow(<Title>My title</Title>);
    wrapper.setProps({ tagName: 'h2' });
    expect(wrapper).toMatchSnapshot();
  });
});
