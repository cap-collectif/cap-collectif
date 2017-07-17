// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import FacebookLoginButton from './FacebookLoginButton';
import IntlData from '../../../translations/FR';

describe('<FacebookLoginButton />', () => {
  const props = {
    ...IntlData,
  };

  it('renders nothing if login_facebook is not activated', () => {
    const wrapper = shallow(<FacebookLoginButton features={{ login_facebook: false }} prefix="login." {...props} />);
    expect(wrapper.children()).toHaveLength(0);
  });

  it('renders a button if feature is active', () => {
    const wrapper = shallow(<FacebookLoginButton features={{ login_facebook: true }} prefix="login." {...props} />);
    expect(wrapper.find('a')).toHaveLength(1);
    expect(wrapper.find('a').prop('href')).toEqual('/login/facebook?_destination=about:blank');
    expect(wrapper.find('a').prop('title')).toEqual('Se connecter via Facebook');
    expect(wrapper.find('a').prop('className')).toEqual('btn login__social-btn login__social-btn--facebook');
    expect(wrapper.find('a').text()).toEqual('Se connecter via Facebook');
  });

  it('renders a button with correct label', () => {
    const wrapper = shallow(<FacebookLoginButton features={{ login_facebook: true }} prefix="registration." {...props} />);
    expect(wrapper.find('a')).toHaveLength(1);
    expect(wrapper.find('a').text()).toEqual('S\'inscrire via Facebook');
  });
});
