/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { NavbarToggle } from './NavbarToggle';

const props = {
  onClick: jest.fn(),
};

describe('<NavbarToggle />', () => {
  it('should render expanded correctly', () => {
    const wrapper = shallow(<NavbarToggle {...props} expanded />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render non-expanded correctly', () => {
    const wrapper = shallow(<NavbarToggle {...props} expanded={false} />);
    expect(wrapper).toMatchSnapshot();
  });
});
