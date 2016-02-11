/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import MainNavbarUser from './MainNavbarUser';
import IntlData from '../../../translations/Synthesis/FR';

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

  // waiting for rewire

  /* it('should render nothing when user is not logged in', () => {
    MainNavbarUser.__Rewire__('LoginStore', {
      isLoggedIn: false,
      user: null,
    });
    const wrapper = shallow(<MainNavbarUser {...IntlData} />);
    expect(wrapper.children()).to.have.length(0);
  });

  it('should render the dropdown without admin menu item when user is not admin', () => {
    MainNavbarUser.__Rewire__('LoginStore', {
      isLoggedIn: true,
      user: user,
    });
    const wrapper = shallow(<MainNavbarUser {...IntlData} />);
    expect(wrapper.find('Nav')).to.have.length(1);
    expect(wrapper.find('NavDropdown')).to.have.length(1);
    expect(wrapper.find('MenuItem')).to.have.length(4);
  });

  it('should render the dropdown with admin menu item when user is admin', () => {
    MainNavbarUser.__Rewire__('LoginStore', {
      isLoggedIn: true,
      user: admin,
    });
    const wrapper = shallow(<MainNavbarUser {...IntlData} />);
    expect(wrapper.find('Nav')).to.have.length(1);
    expect(wrapper.find('NavDropdown')).to.have.length(1);
    expect(wrapper.find('MenuItem')).to.have.length(5);
  }); */
});
