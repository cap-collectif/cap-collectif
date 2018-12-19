// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { LoginOverlay } from './LoginOverlay';

describe('<LoginOverlay />', () => {
  const props = {
    isLoginOrRegistrationModalOpen: false,
    showRegistrationButton: false,
    openRegistrationModal: jest.fn(),
  };

  it('renders children if not enabled', () => {
    const wrapper = shallow(
      <LoginOverlay enabled={false} showRegistrationButton {...props}>
        <div className="foo" />
      </LoginOverlay>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders children if user is logged', () => {
    const wrapper = shallow(
      <LoginOverlay enabled user={{}} showRegistrationButton {...props}>
        <div className="foo" />
      </LoginOverlay>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders popover if user is not logged', () => {
    const wrapper = shallow(
      <LoginOverlay enabled user={null} showRegistrationButton {...props}>
        <div className="foo" />
      </LoginOverlay>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
