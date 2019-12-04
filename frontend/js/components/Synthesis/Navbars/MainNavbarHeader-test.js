/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import MainNavbarHeader from './MainNavbarHeader';

describe('<MainNavbarHeader />', () => {
  it('should render a navbar header and a navbar brand', () => {
    const wrapper = shallow(<MainNavbarHeader />);
    expect(wrapper.find('NavbarHeader')).toHaveLength(1);
    expect(wrapper.find('NavbarBrand')).toHaveLength(1);
  });
});
