// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { LoginSocialButton } from './LoginSocialButton';

const baseProps = {
  primaryColor: '#fffeee',
  colorText: '#fff',
}

describe('<LoginSocialButton />', () => {
  it('should render correctly', () => {
    const props = {
      ...baseProps,
      type: 'facebook',
      switchUserMode: false,
    };
    const wrapper = shallow(<LoginSocialButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly franceConnect', () => {
    const props = {
      ...baseProps,
      type: 'franceConnect',
      switchUserMode: false,
    };
    const wrapper = shallow(<LoginSocialButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with grandLyonConnect', () => {
    const props = {
      ...baseProps,
      type: 'openId',
      text: 'grandLyonConnect',
    };
    const wrapper = shallow(<LoginSocialButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with switchusermode', () => {
    const props = {
      ...baseProps,
      type: 'openId',
      switchUserMode: true,
      text: 'openid',
    };
    const wrapper = shallow(<LoginSocialButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
