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
    FacebookLoginButton.__Rewire__('FeatureStore', {
      isActive: () => false,
    });
    const wrapper = shallow(<FacebookLoginButton {...props} />);
    expect(wrapper.children()).to.have.length(0);
  });

  it('renders a button if feature is active', () => {
    FacebookLoginButton.__Rewire__('FeatureStore', {
      isActive: () => true,
    });
    const wrapper = shallow(<FacebookLoginButton {...props} />);
    expect(wrapper.find('a')).to.have.length(1);
    expect(wrapper.find('a').html()).to.equal('<a href="/login/facebook?_destination=about:blank" title="Sign in with Facebook" class="btn login__social-btn login__social-btn--facebook">Se connecter avec Facebook</a>');
  });
});
