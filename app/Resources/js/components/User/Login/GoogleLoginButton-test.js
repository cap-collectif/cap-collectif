// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import GoogleLoginButton from './GoogleLoginButton';
import IntlData from '../../../translations/FR';

describe('<GoogleLoginButton />', () => {
  const props = {
    ...IntlData,
  };

  it('renders nothing if login_gplus is not activate', () => {
    const wrapper = shallow(<GoogleLoginButton features={{ login_gplus: false }} prefix="login." {...props} />);
    expect(wrapper.children()).toHaveLength(0);
  });

  it('renders a button if feature is active', () => {
    const wrapper = shallow(<GoogleLoginButton features={{ login_gplus: true }} prefix="login." {...props} />);
    expect(wrapper.find('a')).toHaveLength(1);
    expect(wrapper.find('a').prop('href')).toEqual('/login/google?_destination=about:blank');
    expect(wrapper.find('a').prop('title')).toEqual('Se connecter via Google');
    expect(wrapper.find('a').prop('className')).toEqual('btn login__social-btn login__social-btn--googleplus');
    expect(wrapper.find('a').text()).toEqual('Se connecter via Google');
  });

  it('renders a button with correct label', () => {
    const wrapper = shallow(<GoogleLoginButton features={{ login_gplus: true }} prefix="registration." {...props} />);
    expect(wrapper.find('a')).toHaveLength(1);
    expect(wrapper.find('a').text()).toEqual('S\'inscrire via Google');
  });
});
