// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { FranceConnectLoginButton } from './FranceConnectLoginButton';
import { features } from '../../../redux/modules/default';

describe('<FranceConnectLoginButton />', () => {
  const defaultProps = {
    features,
  };

  it('renders nothing if login_franceconnect is not activated', () => {
    const wrapper = shallow(<FranceConnectLoginButton {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a button if feature is active', () => {
    const props = {
      ...defaultProps,
      features: { ...features, login_franceconnect: true },
    };

    const wrapper = shallow(<FranceConnectLoginButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
