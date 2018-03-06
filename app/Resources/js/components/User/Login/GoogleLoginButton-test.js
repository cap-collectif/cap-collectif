// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import GoogleLoginButton from './GoogleLoginButton';

describe('<GoogleLoginButton />', () => {
  const props = {};

  it('renders nothing if login_gplus is not activate', () => {
    const wrapper = shallow(
      <GoogleLoginButton features={{ login_gplus: false }} prefix="login." {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a button if feature is active', () => {
    const wrapper = shallow(
      <GoogleLoginButton features={{ login_gplus: true }} prefix="login." {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a button with correct label', () => {
    const wrapper = shallow(
      <GoogleLoginButton features={{ login_gplus: true }} prefix="registration." {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
