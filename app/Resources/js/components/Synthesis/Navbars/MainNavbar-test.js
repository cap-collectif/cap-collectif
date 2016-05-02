/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import MainNavbar from './MainNavbar';

describe('<MainNavbar />', () => {
  it('should render a navbar with header, search form and user dropdown', () => {
    const wrapper = shallow(<MainNavbar />);
    expect(wrapper.find('Uncontrolled(Navbar)')).to.have.length(1);
    expect(wrapper.find('Uncontrolled(Navbar)').prop('className')).to.equal('synthesis__main-navbar');
    expect(wrapper.find('MainNavbarHeader')).to.have.length(1);
    expect(wrapper.find('MainNavbarSearch')).to.have.length(1);
    expect(wrapper.find('MainNavbarUser')).to.have.length(1);
  });
});
