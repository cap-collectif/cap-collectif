// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import LoginSocialButton from './LoginSocialButton';

describe('<LoginSocialButton />', () => {
  it('should render correctly', () => {
    const props = {
      type: 'facebook',
      switchUserMode: false,
    };
    const wrapper = shallow(<LoginSocialButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with switchusermode', () => {
    const props = {
      type: 'openId',
      switchUserMode: true,
    };
    const wrapper = shallow(<LoginSocialButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
