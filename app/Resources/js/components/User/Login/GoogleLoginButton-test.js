// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import GoogleLoginButton from './GoogleLoginButton';
import { features } from '../../../redux/modules/default';

describe('<GoogleLoginButton />', () => {
  const props = {
    features: { ...features },
  };
  const propsWithFeatureGoogleLoginActivated = {
    features: { ...features, login_gplus: true },
  };
  const propsWithFeatureGoogleLoginActivatedAndRegistrationPrefix = {
    features: { ...features, login_gplus: true },
    prefix: 'registration.',
  };

  it('renders nothing if login_gplus is not activate', () => {
    const wrapper = shallow(<GoogleLoginButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a button if feature is active', () => {
    const wrapper = shallow(<GoogleLoginButton {...propsWithFeatureGoogleLoginActivated} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a button with correct registration label', () => {
    const wrapper = shallow(
      <GoogleLoginButton {...propsWithFeatureGoogleLoginActivatedAndRegistrationPrefix} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
