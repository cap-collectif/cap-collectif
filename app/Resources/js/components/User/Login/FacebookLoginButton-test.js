// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { intlMock } from '../../../mocks';
import { FacebookLoginButton } from './FacebookLoginButton';

describe('<FacebookLoginButton />', () => {
  const defaultProps = {
    intl: intlMock,
  };

  it('renders with no prefix', () => {
    const props = {
      ...defaultProps,
      prefix: '',
    };

    const wrapper = shallow(<FacebookLoginButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a button with correct registration label', () => {
    const props = {
      ...defaultProps,
      prefix: 'registration.',
    };

    const wrapper = shallow(<FacebookLoginButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
