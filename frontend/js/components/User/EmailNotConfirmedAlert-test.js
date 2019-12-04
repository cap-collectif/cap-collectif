// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { EmailNotConfirmedAlert } from './EmailNotConfirmedAlert';

describe('<EmailNotConfirmedAlert />', () => {
  const props = {};
  const userWithConfirmedEmail = {
    isEmailConfirmed: true,
  };
  const userWithNotConfirmedEmail = {
    isEmailConfirmed: false,
  };

  it('renders nothing if not logged', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} user={null} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders nothing if logged user has confirmed his email', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} user={userWithConfirmedEmail} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a button to resend confirmation & an alert if user is logged and has not confirmed his email', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} user={userWithNotConfirmedEmail} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a disabled button when resending', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} user={userWithNotConfirmedEmail} />);
    wrapper.setState({ resendingConfirmation: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a disabled button when resending is done', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} user={userWithNotConfirmedEmail} />);
    wrapper.setState({ confirmationSent: true });
    expect(wrapper).toMatchSnapshot();
  });
});
