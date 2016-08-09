/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import FacebookLoginButton from './FacebookLoginButton';
import IntlData from '../../../translations/FR';

describe('<FacebookLoginButton />', () => {
  const props = {
    ...IntlData,
  };

  it('renders nothing if login_facebook is not activated', () => {
    const wrapper = shallow(<FacebookLoginButton features={{ login_facebook: false }} prefix="login." {...props} />);
    expect(wrapper.children()).to.have.length(0);
  });

  it('renders a button if feature is active', () => {
    const wrapper = shallow(<FacebookLoginButton features={{ login_facebook: true }} prefix="login." {...props} />);
    expect(wrapper.find('a')).to.have.length(1);
    expect(wrapper.find('a').prop('href')).to.equal('/login/facebook?_destination=about:blank');
    expect(wrapper.find('a').prop('title')).to.equal('Se connecter via Facebook');
    expect(wrapper.find('a').prop('className')).to.equal('btn login__social-btn login__social-btn--facebook');
    expect(wrapper.find('a').text()).to.equal('Se connecter via Facebook');
  });

  it('renders a button with correct label', () => {
    const wrapper = shallow(<FacebookLoginButton features={{ login_facebook: true }} prefix="registration." {...props} />);
    expect(wrapper.find('a')).to.have.length(1);
    expect(wrapper.find('a').text()).to.equal('S\'inscrire via Facebook');
  });
});
