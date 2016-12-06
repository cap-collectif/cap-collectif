/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import GoogleLoginButton from './GoogleLoginButton';
import IntlData from '../../../translations/FR';

describe('<GoogleLoginButton />', () => {
  const props = {
    ...IntlData,
  };

  it('renders nothing if login_gplus is not activate', () => {
    const wrapper = shallow(<GoogleLoginButton features={{ login_gplus: false }} prefix="login." {...props} />);
    expect(wrapper.children()).to.have.length(0);
  });

  it('renders a button if feature is active', () => {
    const wrapper = shallow(<GoogleLoginButton features={{ login_gplus: true }} prefix="login." {...props} />);
    expect(wrapper.find('a')).to.have.length(1);
    expect(wrapper.find('a').prop('href')).to.equal('/login/google?_destination=about:blank');
    expect(wrapper.find('a').prop('title')).to.equal('Se connecter via Google');
    expect(wrapper.find('a').prop('className')).to.equal('btn login__social-btn login__social-btn--googleplus');
    expect(wrapper.find('a').text()).to.equal('Se connecter via Google');
  });

  it('renders a button with correct label', () => {
    const wrapper = shallow(<GoogleLoginButton features={{ login_gplus: true }} prefix="registration." {...props} />);
    expect(wrapper.find('a')).to.have.length(1);
    expect(wrapper.find('a').text()).to.equal('S\'inscrire via Google');
  });
});
