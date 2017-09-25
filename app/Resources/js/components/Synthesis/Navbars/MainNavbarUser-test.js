/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { MainNavbarUser } from './MainNavbarUser';

describe('<MainNavbarUser />', () => {
  const user = {
    displayName: 'user',
    isAdmin: false,
    _links: {
      profile: '',
      settings: '',
    },
  };
  const admin = {
    displayName: 'admin',
    isAdmin: true,
    _links: {
      profile: '',
      settings: '',
    },
  };
  const features = {
    profiles: true,
  };

  it('should render nothing when user is not logged in', () => {
    const wrapper = shallow(<MainNavbarUser user={null} features={features} />);
    expect(wrapper.children()).toHaveLength(0);
  });

  it('should render the dropdown without admin menu item when user is not admin', () => {
    const wrapper = shallow(<MainNavbarUser user={user} features={features} />);
    expect(wrapper.find('Nav')).toHaveLength(1);
    expect(wrapper.find('NavDropdown')).toHaveLength(1);
    expect(wrapper.find('MenuItem')).toHaveLength(4);
  });

  it('should render the dropdown with admin menu item when user is admin', () => {
    const wrapper = shallow(<MainNavbarUser user={admin} features={features} />);
    expect(wrapper.find('Nav')).toHaveLength(1);
    expect(wrapper.find('NavDropdown')).toHaveLength(1);
    expect(wrapper.find('MenuItem')).toHaveLength(5);
  });
});
