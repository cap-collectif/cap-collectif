// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import SamlLoginButton from './SamlLoginButton';
import { features } from '../../../redux/modules/default';

describe('<SamlLoginButton />', () => {
  const defaultProps = {
    features: { ...features },
  };

  it('renders nothing when feature is not active', () => {
    const wrapper = shallow(<SamlLoginButton {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders when feature is active', () => {
    const props = {
      ...defaultProps,
      features: { ...features, login_saml: true },
    };

    const wrapper = shallow(<SamlLoginButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with no prefix', () => {
    const props = {
      ...defaultProps,
      features: { ...features, login_saml: true },
      prefix: '',
    };

    const wrapper = shallow(<SamlLoginButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
