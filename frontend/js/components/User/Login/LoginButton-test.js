// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { LoginButton } from './LoginButton';

describe('<LoginButton />', () => {
  const props = {
    className: 'btn-darkest-gray navbar-btn btn--connection',
    loginWithOpenID: false,
    byPassLoginModal: false,
    oauth2SwitchUser: false,
    openLoginModal: jest.fn(),
  };

  it('renders a button', () => {
    const wrapper = shallow(<LoginButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
