// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { LoginOverlay } from './LoginOverlay';

jest.mock('reakit/Popover', () => ({
  ...jest.requireActual('reakit/Popover'),
  usePopoverState: () => ({
    ...jest.requireActual('reakit/Popover').usePopoverState({ baseId: 'mock' }),
    unstable_popoverStyles: {
      left: '100%',
      position: 'fixed',
      top: '100%',
    },
  }),
}));

describe('<LoginOverlay />', () => {
  const props = {
    showRegistrationButton: false,
    dispatch: jest.fn(),
  };

  it('renders children if not enabled', () => {
    const wrapper = shallow(
      <LoginOverlay enabled={false} isAuthenticated showRegistrationButton {...props}>
        <div className="foo" />
      </LoginOverlay>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders children if user is logged', () => {
    const wrapper = shallow(
      <LoginOverlay enabled isAuthenticated showRegistrationButton {...props}>
        <div className="foo" />
      </LoginOverlay>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders popover if user is not logged', () => {
    const wrapper = shallow(
      <LoginOverlay enabled isAuthenticated={false} showRegistrationButton {...props}>
        <div className="foo" />
      </LoginOverlay>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
