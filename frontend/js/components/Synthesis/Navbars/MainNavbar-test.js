/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import MainNavbar from './MainNavbar';
import MainNavbarUser from './MainNavbarUser';

describe('<MainNavbar />', () => {
  it('should render a navbar with header, search form and user dropdown', () => {
    const wrapper = shallow(<MainNavbar />);
    expect(wrapper.find('Uncontrolled(Navbar)')).toHaveLength(1);
    expect(wrapper.find('Uncontrolled(Navbar)').prop('className')).toEqual(
      'synthesis__main-navbar',
    );
    expect(wrapper.find('MainNavbarHeader')).toHaveLength(1);
    expect(wrapper.find('MainNavbarSearch')).toHaveLength(1);
    expect(wrapper.find(MainNavbarUser)).toHaveLength(1);
  });
});
