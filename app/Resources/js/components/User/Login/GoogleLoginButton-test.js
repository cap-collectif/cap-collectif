// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import GoogleLoginButton from './GoogleLoginButton';
import { features } from '../../../redux/modules/default';

describe('<GoogleLoginButton />', () => {
  const defaultProps = {
    features: { ...features },
  };

  it('renders nothing if login_gplus is not activate', () => {
    const wrapper = shallow(<GoogleLoginButton {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a button if feature is active', () => {
    const props = {
      features: { ...features, login_gplus: true },
    };

    const wrapper = shallow(<GoogleLoginButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders without prefix', () => {
    const props = {
      ...defaultProps,
      features: { ...features, login_gplus: true },
      prefix: '',
    };

    const wrapper = shallow(<GoogleLoginButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a button with correct registration label', () => {
    const props = {
      features: { ...features, login_gplus: true },
      prefix: 'registration.',
    };

    const wrapper = shallow(<GoogleLoginButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
