// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import FacebookLoginButton from './FacebookLoginButton';
import { features } from '../../../redux/modules/default';

describe('<FacebookLoginButton />', () => {
  const props = {
    features: { ...features },
  };
  const propsWithFeatureFacebookLoginActivated = {
    features: { ...features, login_facebook: true },
  };
  const propsWithFeatureFacebookLoginActivatedAndRegistrationPrefix = {
    features: { ...features, login_facebook: true },
    prefix: 'registration.',
  };

  it('renders nothing if login_facebook is not activated', () => {
    const wrapper = shallow(<FacebookLoginButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a button if feature is active', () => {
    const wrapper = shallow(<FacebookLoginButton {...propsWithFeatureFacebookLoginActivated} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a button with correct registration label', () => {
    const wrapper = shallow(
      <FacebookLoginButton {...propsWithFeatureFacebookLoginActivatedAndRegistrationPrefix} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
