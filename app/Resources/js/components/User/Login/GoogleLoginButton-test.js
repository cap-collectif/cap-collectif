// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { intlMock } from '../../../mocks';
import { GoogleLoginButton } from './GoogleLoginButton';

describe('<GoogleLoginButton />', () => {
  const defaultProps = {
    intl: intlMock,
  };

  it('renders', () => {
    const props = {
      ...defaultProps,
    };

    const wrapper = shallow(<GoogleLoginButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders without prefix', () => {
    const props = {
      ...defaultProps,
      prefix: '',
    };

    const wrapper = shallow(<GoogleLoginButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a button with correct registration label', () => {
    const props = {
      ...defaultProps,
      prefix: 'registration.',
    };

    const wrapper = shallow(<GoogleLoginButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
