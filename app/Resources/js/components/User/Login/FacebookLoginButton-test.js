// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import FacebookLoginButton from './FacebookLoginButton';

describe('<FacebookLoginButton />', () => {
  const props = {};

  it('renders nothing if login_facebook is not activated', () => {
    const wrapper = shallow(
      <FacebookLoginButton features={{ login_facebook: false }} prefix="login." {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a button if feature is active', () => {
    const wrapper = shallow(
      <FacebookLoginButton features={{ login_facebook: true }} prefix="login." {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a button with correct label', () => {
    const wrapper = shallow(
      <FacebookLoginButton features={{ login_facebook: true }} prefix="registration." {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
