/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import MainNavbarHeader from './MainNavbarHeader';

describe('<MainNavbarHeader />', () => {
  it('should render a navbar header and a navbar brand', () => {
    const wrapper = shallow(<MainNavbarHeader />);
    expect(wrapper.find('NavbarHeader')).to.have.length(1);
    expect(wrapper.find('NavbarBrand')).to.have.length(1);
  });
});
