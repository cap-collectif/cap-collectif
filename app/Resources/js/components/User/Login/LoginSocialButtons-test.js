// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { LoginSocialButtons } from './LoginSocialButtons';

describe('<LoginSocialButtons />', () => {
  const props = {};

  it('renders nothing if login_facebook is not activate', () => {
    const wrapper = shallow(
      <LoginSocialButtons features={{ login_facebook: false, login_gplus: false }} {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a button if feature is active', () => {
    const wrapper = shallow(
      <LoginSocialButtons features={{ login_facebook: true, login_gplus: true }} {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
