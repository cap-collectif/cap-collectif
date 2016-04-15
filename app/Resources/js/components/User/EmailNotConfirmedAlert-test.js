/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import EmailNotConfirmedAlert from './EmailNotConfirmedAlert';
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
    expect(wrapper.children()).to.have.length(0);
  });

  it('renders nothing if logged user has confirmed his email', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} user={userWithConfirmedEmail} />);
    expect(wrapper.children()).to.have.length(0);
  });

  it('renders an alert if user is logged and has not confirmed his email', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} user={userWithNotConfirmedEmail} />);
    expect(wrapper.find('Alert')).to.have.length(1);
  });

  it('renders a button to resend confirmation', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} user={userWithNotConfirmedEmail} />);
    expect(wrapper.find('Button')).to.have.length(1);
    expect(wrapper.find('Button').prop('disabled')).to.equal(false);
    expect(wrapper.find('Button').prop('onClick')).to.be.a('function');
  });

  it('renders a disabled button when resending', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} user={userWithNotConfirmedEmail} />);
    wrapper.setState({ resendingConfirmation: true });
    expect(wrapper.find('Button').prop('onClick')).to.be.null;
    expect(wrapper.find('Button').prop('disabled')).to.equal(true);
  });

  it('renders a disabled button when resending is done', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert {...props} user={userWithNotConfirmedEmail} />);
    wrapper.setState({ confirmationSent: true });
    expect(wrapper.find('Button').prop('bsStyle')).to.equal('primary');
    expect(wrapper.find('Button').prop('disabled')).to.equal(true);
  });
});
