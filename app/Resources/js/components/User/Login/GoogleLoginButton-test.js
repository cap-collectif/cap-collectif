/* eslint-env mocha */
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
    GoogleLoginButton.__Rewire__('FeatureStore', {
      isActive: () => false,
    });
    const wrapper = shallow(<GoogleLoginButton {...props} />);
    expect(wrapper.children()).to.have.length(0);
  });

  it('renders a button if feature is active', () => {
    GoogleLoginButton.__Rewire__('FeatureStore', {
      isActive: () => true,
    });
    const wrapper = shallow(<GoogleLoginButton {...props} />);
    expect(wrapper.find('a')).to.have.length(1);
    expect(wrapper.find('a').html()).to.equal('<a href="/login/google?_destination=about:blank" title="Sign in with Google" class="btn login__social-btn login__social-btn--googleplus">Se connecter avec Google</a>');
  });
});
