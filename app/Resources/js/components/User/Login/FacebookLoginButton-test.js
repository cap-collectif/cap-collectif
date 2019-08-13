// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { intlMock } from '../../../mocks';
import { FacebookLoginButton } from './FacebookLoginButton';
import { features } from '../../../redux/modules/default';

describe('<FacebookLoginButton />', () => {
  const defaultProps = {
    features: { ...features },
    intl: intlMock,
  };

  it('renders nothing if login_facebook is not activated', () => {
    const wrapper = shallow(<FacebookLoginButton {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with no prefix', () => {
    const props = {
      ...defaultProps,
      features: { ...features, login_facebook: true },
      prefix: '',
    };

    const wrapper = shallow(<FacebookLoginButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a button if feature is active', () => {
    const props = {
      ...defaultProps,
      features: { ...features, login_facebook: true },
    };

    const wrapper = shallow(<FacebookLoginButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a button with correct registration label', () => {
    const props = {
      ...defaultProps,
      features: { ...features, login_facebook: true },
      prefix: 'registration.',
    };

    const wrapper = shallow(<FacebookLoginButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
