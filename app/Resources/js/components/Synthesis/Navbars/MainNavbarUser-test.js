/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { MainNavbarUser } from './MainNavbarUser';
import IntlData from '../../../translations/FR';

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
    const wrapper = shallow(<MainNavbarUser user={null} features={features} {...IntlData} />);
    expect(wrapper.children()).to.have.length(0);
  });

  it('should render the dropdown without admin menu item when user is not admin', () => {
    const wrapper = shallow(<MainNavbarUser user={user} features={features} {...IntlData} />);
    expect(wrapper.find('Nav')).to.have.length(1);
    expect(wrapper.find('NavDropdown')).to.have.length(1);
    expect(wrapper.find('MenuItem')).to.have.length(4);
  });

  it('should render the dropdown with admin menu item when user is admin', () => {
    const wrapper = shallow(<MainNavbarUser user={admin} features={features} {...IntlData} />);
    expect(wrapper.find('Nav')).to.have.length(1);
    expect(wrapper.find('NavDropdown')).to.have.length(1);
    expect(wrapper.find('MenuItem')).to.have.length(5);
  });
});
