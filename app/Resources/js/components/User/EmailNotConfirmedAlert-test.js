/* eslint-env jest */

import React from 'react';

import { shallow } from 'enzyme';
import { EmailNotConfirmedAlert } from './EmailNotConfirmedAlert';
import IntlData from '../../translations/FR';

describe('<EmailNotConfirmedAlert />', () => {
  const props = {
    ...IntlData,
  };
  const userWithConfirmedEmail = {
    isEmailConfirmed: true,
  };
  const userWithNotConfirmedEmail = {
    isEmailConfirmed: false,
  };

  it('renders nothing if not logged', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} user={null} />);
    expect(wrapper.children()).toHaveLength(0);
  });

  it('renders nothing if logged user has confirmed his email', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} user={userWithConfirmedEmail} />);
    expect(wrapper.children()).toHaveLength(0);
  });

  it('renders an alert if user is logged and has not confirmed his email', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} user={userWithNotConfirmedEmail} />);
    expect(wrapper.find('Alert')).toHaveLength(1);
  });

  it('renders a button to resend confirmation', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} user={userWithNotConfirmedEmail} />);
    expect(wrapper.find('Button').first().prop('disabled')).toEqual(false);
    expect(wrapper.find('Button').first().prop('onClick')).toBeDefined();
  });

  it('renders a disabled button when resending', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} user={userWithNotConfirmedEmail} />);
    wrapper.setState({ resendingConfirmation: true });
    expect(wrapper.find('Button').first().prop('onClick')).toEqual(null);
    expect(wrapper.find('Button').first().prop('disabled')).toEqual(true);
  });

  it('renders a disabled button when resending is done', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} user={userWithNotConfirmedEmail} />);
    wrapper.setState({ confirmationSent: true });
    expect(wrapper.find('Button').first().prop('bsStyle')).toEqual('primary');
    expect(wrapper.find('Button').first().prop('disabled')).toEqual(true);
  });
});
